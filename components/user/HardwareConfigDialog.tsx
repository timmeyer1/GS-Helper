"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import HardwareSelectDialog, { HardwareItem } from "./HardwareSelectDialog";

interface UserConfig {
  gpu_id?: HardwareItem;
  cpu_id?: HardwareItem;
  ram_id?: HardwareItem;
  screenresolution_id?: HardwareItem;
}

interface ApiResponse {
  message: string;
  config: UserConfig;
}

interface HardwareConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: UserConfig | null;
  onConfigUpdated: (config: UserConfig) => void;
}

const HardwareConfigDialog = ({
  open,
  onOpenChange,
  config,
  onConfigUpdated,
}: HardwareConfigDialogProps) => {
  const [selectedConfig, setSelectedConfig] = useState<{
    gpu?: HardwareItem;
    cpu?: HardwareItem;
    ram?: HardwareItem;
    screenresolution?: HardwareItem;
  }>({
    gpu: config?.gpu_id,
    cpu: config?.cpu_id,
    ram: config?.ram_id,
    screenresolution: config?.screenresolution_id,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hardwareDialogOpen, setHardwareDialogOpen] = useState(false);
  const [currentHardwareType, setCurrentHardwareType] = useState<string>("");

  // Réinitialiser les états lorsque la boîte de dialogue s'ouvre
  const handleOpenChange = (open: boolean) => {
    if (open && config) {
      setSelectedConfig({
        gpu: config.gpu_id,
        cpu: config.cpu_id,
        ram: config.ram_id,
        screenresolution: config.screenresolution_id,
      });
      setCurrentPassword("");
    }
    onOpenChange(open);
  };

  const handleOpenHardwareDialog = (type: string) => {
    setCurrentHardwareType(type);
    setHardwareDialogOpen(true);
  };

  const handleSelectHardware = (item: HardwareItem) => {
    setSelectedConfig((prev) => ({
      ...prev,
      [currentHardwareType]: item,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!currentPassword) {
    //   toast.error("Veuillez entrer votre mot de passe pour confirmer les modifications");
    //   return;
    // }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gpuId: selectedConfig.gpu?._id,
          cpuId: selectedConfig.cpu?._id,
          ramId: selectedConfig.ram?._id,
          screenResolutionId: selectedConfig.screenresolution?._id,
          currentPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour de la configuration");
      }

      const data = await response.json() as ApiResponse;

      toast.success("Configuration matérielle mise à jour avec succès");
      onConfigUpdated(data.config);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la configuration:", error);
      toast.error(error.message || "Erreur lors de la mise à jour de la configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (currentHardwareType) {
      case "gpu":
        return "Sélectionnez votre carte graphique";
      case "cpu":
        return "Sélectionnez votre processeur";
      case "ram":
        return "Sélectionnez votre mémoire RAM";
      case "screenresolution":
        return "Sélectionnez votre résolution d'écran";
      default:
        return "";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier ma configuration matérielle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Carte graphique</Label>
                  <p className="text-sm text-gray-500">
                    {selectedConfig.gpu?.libelle || "Non sélectionné"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenHardwareDialog("gpu")}
                >
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Processeur</Label>
                  <p className="text-sm text-gray-500">
                    {selectedConfig.cpu?.libelle || "Non sélectionné"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenHardwareDialog("cpu")}
                >
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mémoire RAM</Label>
                  <p className="text-sm text-gray-500">
                    {selectedConfig.ram?.libelle || "Non sélectionné"}
                    {selectedConfig.ram?.type && (
                      <span className="text-gray-500 italic font-normal">
                        {" "}({selectedConfig.ram.type})
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenHardwareDialog("ram")}
                >
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Résolution d'écran</Label>
                  <p className="text-sm text-gray-500">
                    {selectedConfig.screenresolution?.libelle || "Non sélectionné"}
                    {(selectedConfig.screenresolution?.width &&
                      selectedConfig.screenresolution?.height &&
                      selectedConfig.screenresolution?.aspectRatio) && (
                        <span className="text-gray-500 italic font-normal">
                          {" "}({selectedConfig.screenresolution.width}x{selectedConfig.screenresolution.height} - {selectedConfig.screenresolution.aspectRatio})
                        </span>
                      )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenHardwareDialog("screenresolution")}
                >
                  Modifier
                </Button>
              </div>

              {/* <div className="mt-4">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Votre mot de passe est requis pour confirmer ces modifications
                </p>
              </div> */}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de sélection du matériel */}
      <HardwareSelectDialog
        open={hardwareDialogOpen}
        onOpenChange={setHardwareDialogOpen}
        type={currentHardwareType}
        title={getDialogTitle()}
        onSelectItem={handleSelectHardware}
      />
    </>
  );
};

export default HardwareConfigDialog;