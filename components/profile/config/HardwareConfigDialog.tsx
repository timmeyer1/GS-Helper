"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import HardwareSelectDialog, { HardwareItem } from "./HardwareSelectDialog";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  config?: {
    gpu_id?: HardwareItem;
    cpu_id?: HardwareItem;
    ram_id?: HardwareItem;
    screenresolution_id?: HardwareItem;
  };
}

interface HardwareConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: User['config'] | null;
  onConfigUpdated: (config: User['config']) => void;
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
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [hardwareDialogOpen, setHardwareDialogOpen] = useState(false);
  const [currentHardwareType, setCurrentHardwareType] = useState<string>("");

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && config) {
      setSelectedConfig({
        gpu: config.gpu_id,
        cpu: config.cpu_id,
        ram: config.ram_id,
        screenresolution: config.screenresolution_id,
      });
    }
    onOpenChange(isOpen);
  };

  const handleOpenHardwareDialog = (type: string) => {
    setCurrentHardwareType(type);
    setHardwareDialogOpen(true);
  };

  const handleSelectHardware = (item: HardwareItem) => {
    setSelectedConfig(prev => ({ ...prev, [currentHardwareType]: item }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gpuId: selectedConfig.gpu?._id,
          cpuId: selectedConfig.cpu?._id,
          ramId: selectedConfig.ram?._id,
          screenResolutionId: selectedConfig.screenresolution?._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      const { config: updatedConfig } = await response.json();
      toast.success("Configuration mise à jour avec succès");
      onConfigUpdated(updatedConfig);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    const titles = {
      gpu: "Sélectionnez votre carte graphique",
      cpu: "Sélectionnez votre processeur",
      ram: "Sélectionnez votre mémoire RAM",
      screenresolution: "Sélectionnez votre résolution d'écran"
    };
    return titles[currentHardwareType as keyof typeof titles] || "";
  };

  const hardwareItems = [
    {
      key: "gpu",
      label: "Carte graphique",
      value: selectedConfig.gpu
    },
    {
      key: "cpu",
      label: "Processeur",
      value: selectedConfig.cpu
    },
    {
      key: "ram",
      label: "Mémoire RAM",
      value: selectedConfig.ram,
      showType: true
    },
    {
      key: "screenresolution",
      label: "Résolution d'écran",
      value: selectedConfig.screenresolution,
      showDetails: true
    }
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier ma configuration matérielle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {hardwareItems.map(({ key, label, value, showType, showDetails }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label>{label}</Label>
                    <p className="text-sm text-gray-500">
                      {value?.libelle || "Non configuré"}
                      {showType && value?.type && (
                        <span className="text-gray-500 italic"> ({value.type})</span>
                      )}
                      {showDetails && value?.width && value?.height && value?.aspectRatio && (
                        <span className="text-gray-500 italic">
                          {" "}({value.width}x{value.height} - {value.aspectRatio})
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenHardwareDialog(key)}
                  >
                    Modifier
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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