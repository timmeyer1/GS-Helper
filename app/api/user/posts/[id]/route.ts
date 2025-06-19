// app/api/user/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post";
import User from "@/models/User";

// PUT - Modifier un post spécifique de l'utilisateur
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { content, postType, expectedFps, settings } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Le contenu est obligatoire" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier que le post appartient bien à l'utilisateur
    const post = await Post.findOne({ _id: params.id, user_id: user._id });
    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Mettre à jour le post
    await Post.findByIdAndUpdate(params.id, {
      content: content.trim(),
      postType: postType || 'equilibre',
      expectedFps: expectedFps || '60-80',
      settings: settings || {},
      updated_at: new Date()
    });

    return NextResponse.json({
      message: "Post modifié avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la modification du post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un post spécifique de l'utilisateur
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que le post appartient bien à l'utilisateur et le supprimer
    const deletedPost = await Post.findOneAndDelete({ 
      _id: params.id, 
      user_id: user._id 
    });

    if (!deletedPost) {
      return NextResponse.json(
        { error: "Post non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Post supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}