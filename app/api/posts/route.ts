import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post/post";
import User from "@/models/user/User";
import UserConfig from "@/models/user/UserConfig";
import Setting from "@/models/settings/settings";
import Preset from "@/models/settings/preset";
import { fetchFromIGDB } from "@/lib/igdb";

// GET - Récupérer les posts avec les settings/presets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const getSettings = searchParams.get("settings");
    const getPresets = searchParams.get("presets");
    
    // Si on demande les settings ou presets
    if (getSettings || getPresets) {
      await connectToDatabase();
      
      if (getSettings) {
        const settings = await Setting.find();
        return NextResponse.json({ settings });
      }
      
      if (getPresets) {
        const presets = await Preset.find();
        return NextResponse.json({ presets });
      }
    }

    // Code existant pour récupérer les posts (inchangé)
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

// ADD - Créer un nouveau post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await req.json();
    const { gameId, content, settings, postType, expectedFps } = data;
    
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

    const userConfig = await UserConfig.findOne({ user_id: user._id });
    
    if (!userConfig) {
      return NextResponse.json(
        { error: "Veuillez configurer votre matériel avant de publier" },
        { status: 400 }
      );
    }

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
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const post = await Post.findOne({ _id: params.id, user_id: user._id });
    if (!post) {
      return NextResponse.json({ error: "Post non trouvé ou non autorisé" }, { status: 404 });
    }

    await Post.deleteOne({ _id: params.id });
    return NextResponse.json({ message: "Post supprimé avec succès" });

  } catch (error) {
    console.error("Erreur lors de la suppression du post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}