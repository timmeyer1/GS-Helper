"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export interface HardwareItem {
  _id: string;
  libelle: string;
  brand?: string;
  generation?: string;
  type?: string;
  width?: string;
  height?: string;
  aspectRatio?: string;
}

interface ApiResponse {
  items: HardwareItem[];
}

interface HardwareSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  title: string;
  onSelectItem: (item: HardwareItem) => void;
}

const HardwareSelectDialog = ({
  open,
  onOpenChange,
  type,
  title,
  onSelectItem,
}: HardwareSelectDialogProps) => {
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchItems();
    }
  }, [open, type]);

  const fetchItems = async () => {
    try {
      // Adapter le type pour l'API
      let apiType = type;
      if (type === "screenresolution") {
        apiType = "screenresolution";
      }
      
      const response = await fetch(`/api/hardware?type=${apiType}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json() as ApiResponse;
      setItems(data.items || []);
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${type}:`, error);
      toast.error(`Impossible de charger les ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: HardwareItem) => {
    onSelectItem(item);
    onOpenChange(false);
  };

  const renderItemDetails = (item: HardwareItem) => {
    switch (type) {
      case "gpu":
        return (
          <span className="text-gray-500 text-sm">
            {item.brand} - {item.generation}
          </span>
        );
      case "cpu":
        return (
          <span className="text-gray-500 text-sm">
            {item.brand} - {item.generation}
          </span>
        );
      case "ram":
        return (
          <span className="text-gray-500 text-sm">
            {item.type}
          </span>
        );
      case "screenresolution":
        return (
          <span className="text-gray-500 text-sm">
            {item.width}x{item.height} - {item.aspectRatio}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              Aucun élément trouvé
            </p>
          ) : (
            items.map((item) => (
              <Button
                key={item._id}
                variant="ghost"
                className="w-full justify-start flex flex-col items-start hover:bg-gray-100"
                onClick={() => handleSelectItem(item)}
              >
                <span className="font-medium">{item.libelle}</span>
                {renderItemDetails(item)}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HardwareSelectDialog;