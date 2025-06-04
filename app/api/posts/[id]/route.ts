import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post/post";
import User from "@/models/user/User";
import { ObjectId } from "mongodb";

// Interface pour typer l'utilisateur
interface UserDocument {
  _id: ObjectId;
  name?: string;
  email: string;
  image?: string;
}

// Interface pour typer les votes
interface Vote {
  user_id: ObjectId;
}

// GET - Récupérer un post spécifique par son ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier que l'ID est valide
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de post invalide" },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    let currentUser: UserDocument | null = null;
    
    if (session?.user?.email) {
      await connectToDatabase();
      currentUser = await User.findOne({ email: session.user.email }) as UserDocument | null;
    }

    await connectToDatabase();

    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
          pipeline: [{ $project: { name: 1, email: 1, image: 1 } }]
        }
      },
      {
        $lookup: {
          from: "gpus",
          localField: "config.gpu_id",
          foreignField: "_id",
          as: "config.gpu_id",
          pipeline: [{ $project: { libelle: 1, brand: 1, generation: 1, range: 1 } }]
        }
      },
      {
        $lookup: {
          from: "cpus",
          localField: "config.cpu_id",
          foreignField: "_id",
          as: "config.cpu_id",
          pipeline: [{ $project: { libelle: 1, brand: 1, generation: 1, range: 1 } }]
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
          pipeline: [{ $project: { libelle: 1, width: 1, height: 1, aspectRatio: 1 } }]
        }
      },
      { $unwind: { path: "$user_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.gpu_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.cpu_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.ram_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$config.screenresolution_id", preserveNullAndEmptyArrays: true } }
    ];

    const result = await Post.aggregate(pipeline);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Post non trouvé" },
        { status: 404 }
      );
    }

    const post = result[0];

    // Ajouter l'information de vote de l'utilisateur
    const postWithUserVote = {
      ...post,
      hasUserVoted: currentUser ? post.votes.voters.some(
        (vote: Vote) => vote.user_id.toString() === currentUser!._id.toString()
      ) : false
    };

    return NextResponse.json({
      post: postWithUserVote
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du post:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un post (seul l'auteur peut modifier)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier que l'ID est valide
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de post invalide" },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { content, settings, postType, expectedFps } = data;

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email }) as UserDocument | null;
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le post existe et appartient à l'utilisateur
    const post = await Post.findOne({ _id: id, user_id: user._id });
    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, any> = {};
    if (content !== undefined) updateData.content = content;
    if (settings !== undefined) updateData.settings = settings;
    if (postType !== undefined) updateData.postType = postType;
    if (expectedFps !== undefined) updateData.expectedFps = expectedFps;
    
    // Ajouter la date de modification
    updateData.updated_at = new Date();

    // Mettre à jour le post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      message: "Post mis à jour avec succès",
      post: updatedPost
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du post:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un post (seul l'auteur peut supprimer)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier que l'ID est valide
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de post invalide" },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email }) as UserDocument | null;
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le post existe et appartient à l'utilisateur
    const post = await Post.findOne({ _id: id, user_id: user._id });
    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Supprimer le post
    await Post.deleteOne({ _id: id });

    return NextResponse.json({
      message: "Post supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du post:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}