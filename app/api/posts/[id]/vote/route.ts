import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post/post";
import User from "@/models/user/User";

// POST - Ajouter ou retirer un upvote
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Récupérer l'utilisateur
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Récupérer le post
    const post = await Post.findById(params.id);
    
    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVoteIndex = post.votes.voters.findIndex(
      (vote: any) => vote.user_id.toString() === (user._id as string).toString()
    );

    if (existingVoteIndex !== -1) {
      // L'utilisateur a déjà voté, retirer son upvote
      post.votes.upvotes -= 1;
      
      // Supprimer le vote de la liste
      post.votes.voters.splice(existingVoteIndex, 1);
    } else {
      // Nouvel upvote
      post.votes.upvotes += 1;
      post.votes.voters.push({
        user_id: user._id
      });
    }

    await post.save();

    // Vérifier si l'utilisateur a voté après la modification
    const hasUserVoted = post.votes.voters.some(
      (vote: any) => vote.user_id.toString() === (user._id as string).toString()
    );

    return NextResponse.json({
      upvotes: post.votes.upvotes,
      hasUserVoted
    });
  } catch (error) {
    console.error("Erreur lors du vote:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}