"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserRound } from "lucide-react";

const gpus = [
  "NVIDIA GeForce RTX 3060",
  "NVIDIA GeForce RTX 3070",
  "NVIDIA GeForce RTX 3080",
  "AMD Radeon RX 6800",
  "AMD Radeon RX 6900 XT",
];

const cpus = [
  "Intel Core i5-12400F",
  "Intel Core i7-12700K",
  "AMD Ryzen 5 5600X",
  "AMD Ryzen 7 5800X",
];

const Profile = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [pcConfig, setPcConfig] = useState({
    gpu: "Aucune donnée",
    cpu: "Aucune donnée",
    ram: "Aucune donnée",
    resolution: "Aucune donnée",
  });

  const handleOpenDialog = (component: string) => {
    setSelectedComponent(component);
    setOpenDialog(true);
  };

  const handleSelectItem = (item: string) => {
    setPcConfig((prev) => ({
      ...prev,
      [selectedComponent]: item,
    }));
    setOpenDialog(false);
  };

  const getOptions = () => {
    switch (selectedComponent) {
      case "gpu":
        return gpus;
      case "cpu":
        return cpus;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 lg:p-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <UserRound className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Mon Profil
          </h1>
        </div>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-700 mb-8">
          Personnalisez votre profil et configurez votre matériel pour optimiser vos performances en jeu.
        </p>

        {/* Informations */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <section className="pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">Informations</h2>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
              Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at
              nibh elementum imperdiet.
            </p>
          </section>

          {/* Configuration PC */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">Ma Configuration PC</h2>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span>
                  Carte graphique: <span className="font-semibold">{pcConfig.gpu}</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog("gpu")}>
                  Modifier
                </Button>
              </li>
              <li className="flex items-center justify-between">
                <span>
                  Processeur: <span className="font-semibold">{pcConfig.cpu}</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog("cpu")}>
                  Modifier
                </Button>
              </li>
              <li className="flex items-center justify-between">
                <span>
                  Nombre de RAM: <span className="font-semibold">{pcConfig.ram}</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog("ram")}>
                  Modifier
                </Button>
              </li>
              <li className="flex items-center justify-between">
                <span>
                  Résolution d&apos;écran: <span className="font-semibold">{pcConfig.resolution}</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog("resolution")}>
                  Modifier
                </Button>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sélectionnez votre {selectedComponent.toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {getOptions().map((item) => (
              <Button
                key={item}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelectItem(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
