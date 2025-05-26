// app/api/posts/route.ts
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
      // Trier par nombre d'upvotes - downvotes
      sortOption["votes.upvotes - votes.downvotes"] = -1;
    } else if (sort === "date") {
      sortOption.created_at = -1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Exécuter la requête
    const posts = await Post.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("user_id", "name email") // Récupérer les infos de l'utilisateur
      .populate("config.gpu_id", "libelle brand")
      .populate("config.cpu_id", "libelle brand")
      .populate("config.ram_id", "libelle type")
      .populate("config.screenresolution_id", "libelle")
      .lean();

    // Compter le nombre total pour la pagination
    const total = await Post.countDocuments(filter);

    return NextResponse.json({
      posts,
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
    const { gameId, content, settings } = data;
    
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
    // Format de requête IGDB
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