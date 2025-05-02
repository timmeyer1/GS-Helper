import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user/User";
import UserConfig from "@/models/user/UserConfig";
import bcrypt from "bcryptjs";

// Importer tous les modèles nécessaires pour le populate
// Corriger les chemins d'importation
import Gpu from "@/models/hardware/gpu";
import Cpu from "@/models/hardware/cpu";
import Ram from "@/models/hardware/ram";
import ScreenResolution from "@/models/hardware/screenresolution";

// API pour récupérer les informations de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();
    
    // S'assurer que les modèles sont bien importés avant d'utiliser UserConfig
    console.log('Modèles chargés:', 
      !!Gpu.modelName, 
      !!Cpu.modelName, 
      !!Ram.modelName, 
      !!ScreenResolution.modelName
    );
    
    const user = await User.findOne({ email: session.user.email })
      .select("-password")
      .lean();
      
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Récupérer la configuration utilisateur avec les références
    const userConfig = await UserConfig.findOne({ user_id: user._id })
      .populate('gpu_id')
      .populate('cpu_id')
      .populate('ram_id')
      .populate('screenresolution_id')
      .lean();

    return NextResponse.json({ 
      user,
      config: userConfig || null
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// API pour mettre à jour les informations de l'utilisateur
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await req.json();
    const { name, password, currentPassword } = data;

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier le mot de passe actuel
    if (!currentPassword || !user.password) {
      return NextResponse.json(
        { error: "Mot de passe requis pour mettre à jour le profil" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 400 }
      );
    }

    // Mise à jour des informations utilisateur
    if (name) user.name = name;
    
    // Mise à jour du mot de passe si fourni
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return NextResponse.json({ 
      message: "Profil mis à jour avec succès",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}