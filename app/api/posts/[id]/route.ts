import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/post/post";
import User from "@/models/user/User";
import { ObjectId } from "mongodb";

type UserType = { _id: ObjectId; name: string; email: string; image?: string; };

const handleError = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) return handleError("ID de post invalide", 400);

        const session = await getServerSession();
        let currentUser: UserType | null = null;
        
        if (session?.user?.email) {
            await connectToDatabase();
            currentUser = await User.findOne({ email: session.user.email });
        }

        await connectToDatabase();
        const result = await Post.aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user_id", pipeline: [{ $project: { name: 1, email: 1, image: 1 } }] } },
            { $lookup: { from: "gpus", localField: "config.gpu_id", foreignField: "_id", as: "config.gpu_id", pipeline: [{ $project: { libelle: 1, brand: 1, generation: 1, range: 1 } }] } },
            { $lookup: { from: "cpus", localField: "config.cpu_id", foreignField: "_id", as: "config.cpu_id", pipeline: [{ $project: { libelle: 1, brand: 1, generation: 1, range: 1 } }] } },
            { $lookup: { from: "rams", localField: "config.ram_id", foreignField: "_id", as: "config.ram_id", pipeline: [{ $project: { libelle: 1, type: 1 } }] } },
            { $lookup: { from: "screenresolutions", localField: "config.screenresolution_id", foreignField: "_id", as: "config.screenresolution_id", pipeline: [{ $project: { libelle: 1, width: 1, height: 1, aspectRatio: 1 } }] } },
            { $unwind: { path: "$user_id", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$config.gpu_id", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$config.cpu_id", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$config.ram_id", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$config.screenresolution_id", preserveNullAndEmptyArrays: true } }
        ]);

        if (!result?.length) return handleError("Post non trouvé", 404);

        return NextResponse.json({ 
            post: { 
                ...result[0], 
                hasUserVoted: currentUser ? result[0].votes.voters.some((vote: any) => vote.user_id.toString() === currentUser._id.toString()) : false 
            } 
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du post:", error);
        return handleError("Erreur serveur", 500);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) return handleError("ID de post invalide", 400);

        const session = await getServerSession();
        if (!session?.user?.email) return handleError("Non autorisé", 401);

        const { content, settings, postType, expectedFps } = await req.json();
        await connectToDatabase();
        
        const user: UserType | null = await User.findOne({ email: session.user.email });
        if (!user) return handleError("Utilisateur non trouvé", 404);

        const post = await Post.findOne({ _id: id, user_id: user._id });
        if (!post) return handleError("Post non trouvé ou non autorisé", 404);

        const updatedPost = await Post.findByIdAndUpdate(id, {
            ...(content !== undefined && { content }),
            ...(settings !== undefined && { settings }),
            ...(postType !== undefined && { postType }),
            ...(expectedFps !== undefined && { expectedFps }),
            updated_at: new Date()
        }, { new: true });

        return NextResponse.json({ message: "Post mis à jour avec succès", post: updatedPost });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du post:", error);
        return handleError("Erreur serveur", 500);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) return handleError("ID de post invalide", 400);

        const session = await getServerSession();
        if (!session?.user?.email) return handleError("Non autorisé", 401);

        await connectToDatabase();
        const user: UserType | null = await User.findOne({ email: session.user.email });
        if (!user) return handleError("Utilisateur non trouvé", 404);

        const post = await Post.findOne({ _id: id, user_id: user._id });
        if (!post) return handleError("Post non trouvé ou non autorisé", 404);

        await Post.deleteOne({ _id: id });
        return NextResponse.json({ message: "Post supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du post:", error);
        return handleError("Erreur serveur", 500);
    }
}