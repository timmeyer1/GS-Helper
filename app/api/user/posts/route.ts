// app/api/user/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post/post";
import User from "@/models/user/User";

// GET - Récupérer tous les posts de l'utilisateur connecté
export async function GET(req: NextRequest) {
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

    // Récupérer tous les posts de l'utilisateur avec les informations du jeu
    const posts = await Post.find({ user_id: user._id })
      .sort({ created_at: -1 }) // Tri par date décroissante
      .select('game_id game_metadata content settings votes created_at postType expectedFps')
      .lean();

    return NextResponse.json({
      posts,
      total: posts.length
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des posts utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}