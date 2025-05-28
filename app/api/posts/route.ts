import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post/post";
import User from "@/models/user/User";
import { fetchFromIGDB } from "@/lib/igdb";
import UserConfig from "@/models/user/UserConfig";

// GET - Récupérer les posts avec filtrage possible
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("game_id");
    const gpuId = searchParams.get("gpu_id");
    const cpuId = searchParams.get("cpu_id");
    const ramId = searchParams.get("ram_id");
    const screenResolutionId = searchParams.get("screenresolution_id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || "votes"; // votes, date

    // Récupérer l'utilisateur connecté pour les votes
    const session = await getServerSession();
    let currentUser = null;
    
    if (session?.user?.email) {
      await connectToDatabase();
      currentUser = await User.findOne({ email: session.user.email });
    }

    await connectToDatabase();

    // Construire le filtre en fonction des paramètres
    const filter: any = {};
    if (gameId) filter.game_id = parseInt(gameId);
    if (gpuId) filter["config.gpu_id"] = gpuId;
    if (cpuId) filter["config.cpu_id"] = cpuId;
    if (ramId) filter["config.ram_id"] = ramId;
    if (screenResolutionId) filter["config.screenresolution_id"] = screenResolutionId;

    // Déterminer le tri
    const sortOption: any = {};
    if (sort === "votes") {
      sortOption["votes.upvotes"] = -1;
      sortOption["created_at"] = -1;
    } else if (sort === "date") {
      sortOption.created_at = -1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Pipeline d'agrégation pour trier par upvotes
    const pipeline: any[] = [
      { $match: filter },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limit }
    ];

    // Ajouter les lookups pour populate
    pipeline.push(
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
      {
        $unwind: { path: "$user_id", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$config.gpu_id", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$config.cpu_id", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$config.ram_id", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$config.screenresolution_id", preserveNullAndEmptyArrays: true }
      }
    );

    const posts = await Post.aggregate(pipeline);

    // Ajouter l'information de vote de l'utilisateur actuel
    const postsWithUserVotes = posts.map(post => ({
      ...post,
      hasUserVoted: currentUser ? post.votes.voters.some(
        (vote: any) => vote.user_id.toString() === (currentUser._id as string).toString()
      ) : false
    }));

    // Compter le nombre total pour la pagination
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
    console.error("Erreur lors de la récupération des posts:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await req.json();
    const { gameId, content, settings, postType } = data;
    
    if (!gameId || !content) {
      return NextResponse.json(
        { error: "Le jeu et le contenu sont obligatoires" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Récupérer l'utilisateur
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Récupérer les infos du jeu depuis IGDB
    const query = `
      fields name, cover.url;
      where id = ${gameId};
    `;
    
    const gameData = await fetchFromIGDB<any[]>("games", query);
    
    if (!gameData || gameData.length === 0) {
      return NextResponse.json({ error: "Jeu non trouvé" }, { status: 404 });
    }
    
    const game = gameData[0];
    const coverUrl = game.cover ? 
      game.cover.url.replace("t_thumb", "t_cover_big") : 
      null;

    // Récupérer la configuration de l'utilisateur
    const userConfig = await UserConfig.findOne({ user_id: user._id });
    
    if (!userConfig) {
      return NextResponse.json(
        { error: "Veuillez configurer votre matériel avant de publier" },
        { status: 400 }
      );
    }

    // Créer le post
    const newPost = new Post({
      user_id: user._id,
      game_id: gameId,
      game_metadata: {
        name: game.name,
        cover_url: coverUrl,
      },
      config: {
        gpu_id: userConfig.gpu_id,
        cpu_id: userConfig.cpu_id,
        ram_id: userConfig.ram_id,
        screenresolution_id: userConfig.screenresolution_id,
      },
      content,
      settings: settings || {},
      postType: postType || "equilibre", 
    });

    await newPost.save();

    return NextResponse.json({
      message: "Post créé avec succès",
      post: newPost
    });
  } catch (error) {
    console.error("Erreur lors de la création du post:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}