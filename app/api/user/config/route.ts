import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Importer tous les modèles nécessaires pour le populate
import Gpu from "@/models/hardware/gpu";
import Cpu from "@/models/hardware/cpu";
import Ram from "@/models/hardware/ram";
import ScreenResolution from "@/models/hardware/screenresolution";

// API pour mettre à jour la configuration matérielle de l'utilisateur
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await req.json();
    const { gpuId, cpuId, ramId, screenResolutionId, currentPassword } = data;

    await connectToDatabase();
    
    // S'assurer que les modèles sont bien chargés
    console.log('Modèles chargés:', 
      !!Gpu.modelName, 
      !!Cpu.modelName, 
      !!Ram.modelName, 
      !!ScreenResolution.modelName
    );
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Validation du mot de passe (commenté pour le moment)
    // if (!currentPassword || !user.password) {
    //   return NextResponse.json(
    //     { error: "Mot de passe requis pour mettre à jour la configuration" },
    //     { status: 400 }
    //   );
    // }

    // const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { error: "Mot de passe incorrect" },
    //     { status: 400 }
    //   );
    // }

    // Initialiser l'objet config s'il n'existe pas
    if (!user.config) {
      user.config = {};
    }

    // Mettre à jour les champs de configuration
    if (gpuId) user.config.gpu_id = gpuId;
    if (cpuId) user.config.cpu_id = cpuId;
    if (ramId) user.config.ram_id = ramId;
    if (screenResolutionId) user.config.screenresolution_id = screenResolutionId;

    await user.save();

    // Récupérer l'utilisateur mis à jour avec les références peuplées
    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate('config.gpu_id')
      .populate('config.cpu_id')
      .populate('config.ram_id')
      .populate('config.screenresolution_id');

    return NextResponse.json({ 
      message: "Configuration mise à jour avec succès",
      config: updatedUser?.config || null
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la configuration:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}