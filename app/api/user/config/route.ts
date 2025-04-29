import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user/User";
import UserConfig from "@/models/user/UserConfig";
import bcrypt from "bcryptjs";

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
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier le mot de passe actuel
    if (!currentPassword || !user.password) {
      return NextResponse.json(
        { error: "Mot de passe requis pour mettre à jour la configuration" },
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

    // Chercher une configuration existante ou en créer une nouvelle
    let userConfig = await UserConfig.findOne({ user_id: user._id });
    
    if (!userConfig) {
      userConfig = new UserConfig({
        user_id: user._id,
        gpu_id: gpuId,
        cpu_id: cpuId,
        ram_id: ramId,
        screenresolution_id: screenResolutionId
      });
      
      // Mettre à jour la référence dans le modèle utilisateur
      user.userconfig_id = userConfig._id;
      await user.save();
    } else {
      // Mettre à jour les champs existants
      if (gpuId) userConfig.gpu_id = gpuId;
      if (cpuId) userConfig.cpu_id = cpuId;
      if (ramId) userConfig.ram_id = ramId;
      if (screenResolutionId) userConfig.screenresolution_id = screenResolutionId;
    }

    await userConfig.save();

    // Renvoyer la configuration mise à jour avec les informations peuplées
    const updatedConfig = await UserConfig.findById(userConfig._id)
      .populate('gpu_id')
      .populate('cpu_id')
      .populate('ram_id')
      .populate('screenresolution_id');

    return NextResponse.json({ 
      message: "Configuration mise à jour avec succès",
      config: updatedConfig
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la configuration:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}