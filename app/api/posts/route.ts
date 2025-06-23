import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post";
import User from "@/models/User";
import Setting from "@/models/settings";
import { fetchFromIGDB } from "@/lib/igdb";

// Fonction utilitaire pour vérifier si la configuration est complète
function isUserConfigComplete(config: any): boolean {
  if (!config) return false;

  // Vérifier que tous les champs requis existent et ne sont pas null/undefined/vides
  const requiredFields = ['gpu_id', 'cpu_id', 'ram_id', 'screenresolution_id'];

  return requiredFields.every(field => {
    const value = config[field];
    // Vérifier que la valeur existe, n'est pas null, undefined, ou une chaîne vide
    return value !== null && value !== undefined && value !== '';
  });
}

// GET - Récupérer les posts avec les settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const getSettings = searchParams.get("settings");

    // Si on demande les settings
    if (searchParams.get('settings') === 'true') {
      const settings = await Setting.find().lean();
      return NextResponse.json({ settings });
    }

    // Récupération des posts
    const gameId = searchParams.get("game_id");
    const gpuId = searchParams.get("gpu_id");
    const cpuId = searchParams.get("cpu_id");
    const ramId = searchParams.get("ram_id");
    const screenResolutionId = searchParams.get("screenresolution_id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || "votes";

    const session = await getServerSession();
    let currentUser = null;

    if (session?.user?.email) {
      await connectToDatabase();
      currentUser = await User.findOne({ email: session.user.email });
    }

    await connectToDatabase();

    const filter: any = {};
    if (gameId) filter.game_id = parseInt(gameId);
    if (gpuId) filter["config.gpu_id"] = gpuId;
    if (cpuId) filter["config.cpu_id"] = cpuId;
    if (ramId) filter["config.ram_id"] = ramId;
    if (screenResolutionId) filter["config.screenresolution_id"] = screenResolutionId;

    const sortOption: any = {};
    if (sort === "votes") {
      sortOption["votes.upvotes"] = -1;
      sortOption["created_at"] = -1;
    } else if (sort === "date") {
      sortOption.created_at = -1;
    }

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: filter },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
          pipeline: [{ $project: { name: 1, email: 1 } }]
        }
      },
      {
        $lookup: {
          from: "gpus",
          localField: "config.gpu_id",
          foreignField: "_id",
          as: "config.gpu_id",
          pipeline: [{ $project: { libelle: 1, brand: 1 } }]
        }
      },
      {
        $lookup: {
          from: "cpus",
          localField: "config.cpu_id",
          foreignField: "_id",
          as: "config.cpu_id",
          pipeline: [{ $project: { libelle: 1, brand: 1 } }]
        }
      },
      {
        $lookup: {
          from: "rams",
          localField: "config.ram_id",
          foreignField: "_id",
          as: "config.ram_id",
          pipeline: [{ $project: { libelle: 1, type: 1 } }]
        }
      },
      {
        $lookup: {
          from: "screenresolutions",
          localField: "config.screenresolution_id",
          foreignField: "_id",
          as: "config.screenresolution_id",
          pipeline: [{ $project: { libelle: 1 } }]
        }
      },
      { $unwind: { path: "$user_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.gpu_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.cpu_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.ram_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.screenresolution_id", preserveNullAndEmptyArrays: true } }
    ];

    const posts = await Post.aggregate(pipeline);

    const postsWithUserVotes = posts.map(post => ({
      ...post,
      hasUserVoted: currentUser ? post.votes.voters.some(
        (vote: any) => vote.user_id.toString() === (currentUser._id as string).toString()
      ) : false
    }));

    const total = await Post.countDocuments(filter);

    return NextResponse.json({
      posts: postsWithUserVotes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { gameId, content, settings, postType, expectedFps } = await req.json();

    if (!gameId || !content) {
      return NextResponse.json(
        { error: "Le jeu et le contenu sont obligatoires" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérification stricte de la configuration utilisateur
    if (!isUserConfigComplete(user.config)) {
      return NextResponse.json(
        {
          error: "Configuration matérielle incomplète. Veuillez renseigner votre GPU, CPU, RAM et résolution d'écran avant de publier."
        },
        { status: 400 }
      );
    }

    const gameData = await fetchFromIGDB<any[]>("games", `fields name, cover.url; where id = ${gameId};`);

    if (!gameData?.length) {
      return NextResponse.json({ error: "Jeu non trouvé" }, { status: 404 });
    }

    const game = gameData[0];
    const coverUrl = game.cover?.url.replace("t_thumb", "t_cover_big") || null;

    const newPost = new Post({
      user_id: user._id,
      game_id: gameId,
      game_metadata: {
        name: game.name,
        cover_url: coverUrl,
      },
      config: {
        gpu_id: user.config.gpu_id,
        cpu_id: user.config.cpu_id,
        ram_id: user.config.ram_id,
        screenresolution_id: user.config.screenresolution_id,
      },
      content,
      settings: settings || {},
      postType: postType || "equilibre",
      expectedFps: expectedFps || "60-80",
    });

    await newPost.save();

    return NextResponse.json({
      message: "Post créé avec succès",
      post: newPost
    });
  } catch (error) {
    console.error("Erreur lors de la création du post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const post = await Post.findOne({ _id: id, user_id: user._id });
    if (!post) {
      return NextResponse.json({ error: "Post non trouvé ou non autorisé" }, { status: 404 });
    }

    await Post.deleteOne({ _id: id });
    return NextResponse.json({ message: "Post supprimé avec succès" });

  } catch (error) {
    console.error("Erreur lors de la suppression du post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}