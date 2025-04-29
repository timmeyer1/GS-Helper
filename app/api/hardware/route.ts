// app/api/hardware/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Gpu from "@/models/hardware/gpu";
import Cpu from "@/models/hardware/cpu";
import Ram from "@/models/hardware/ram";
import ScreenResolution from "@/models/hardware/screenresolution";

// API pour récupérer tous les composants matériels
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Récupérer l'URL et extraire les paramètres
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    
    // Selon le type demandé, renvoyer les composants correspondants
    switch (type) {
      case "gpu":
        const gpus = await Gpu.find().lean();
        return NextResponse.json({ items: gpus });
        
      case "cpu":
        const cpus = await Cpu.find().lean();
        return NextResponse.json({ items: cpus });
        
      case "ram":
        const rams = await Ram.find().lean();
        return NextResponse.json({ items: rams });
        
      case "screenresolution":
        const screenresolutions = await ScreenResolution.find().lean();
        return NextResponse.json({ items: screenresolutions });
        
      default:
        // Si aucun type spécifié, renvoyer tous les composants
        const [allGpus, allCpus, allRams, allScreenResolutions] = await Promise.all([
          Gpu.find().lean(),
          Cpu.find().lean(),
          Ram.find().lean(),
          ScreenResolution.find().lean()
        ]);
        
        return NextResponse.json({
          gpus: allGpus,
          cpus: allCpus,
          rams: allRams,
          screenresolutions: allScreenResolutions
        });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des composants:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}