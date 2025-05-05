"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Search, ChevronLeft } from "lucide-react";

export interface HardwareItem {
  _id: string;
  libelle: string;
  brand?: string;
  generation?: string;
  type?: string;
  range?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Réinitialiser et charger les données quand le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setLoading(true);
      setSearchQuery("");
      resetNavigation();
      fetchItems();
    }
  }, [open, type]);

  // Réinitialiser la navigation
  const resetNavigation = () => {
    setNavigationPath([]);
    setFilters({});
  };

  // Charger les données depuis l'API
  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/hardware?type=${type}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${type}:`, error);
      toast.error(`Impossible de charger les ${type}`);
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un élément
  const handleSelectItem = (item: HardwareItem) => {
    onSelectItem(item);
    onOpenChange(false);
  };

  // Gérer le retour en arrière dans la navigation
  const goBack = () => {
    if (searchQuery) {
      // Si on est en mode recherche, on efface la recherche
      setSearchQuery("");
      return;
    }

    if (navigationPath.length > 0) {
      // On retire le dernier niveau de navigation
      const newPath = [...navigationPath];
      const removedStep = newPath.pop();
      setNavigationPath(newPath);

      // On met à jour les filtres en conséquence
      if (removedStep) {
        const newFilters = { ...filters };
        delete newFilters[removedStep];
        setFilters(newFilters);
      }
    }
  };

  // Ajouter un niveau de navigation et appliquer le filtre
  const addNavigationStep = (step: string, value: string) => {
    setNavigationPath([...navigationPath, step]);
    setFilters({ ...filters, [step]: value });
  };

  // Options disponibles pour chaque étape de navigation
  const availableNavigationOptions = useMemo(() => {
    // Si on est en mode recherche, on ne montre pas d'options
    if (searchQuery) {
      return [];
    }

    let filteredItems = [...items];

    // Appliquer les filtres existants
    Object.entries(filters).forEach(([key, value]) => {
      filteredItems = filteredItems.filter(item => item[key as keyof HardwareItem] === value);
    });

    // Déterminer l'étape de navigation actuelle
    const currentStep = (() => {
      if (navigationPath.length === 0) {
        // Étape initiale basée sur le type de matériel
        if (type === "gpu" || type === "cpu") return "brand";
        if (type === "ram") return "type";
        return "results"; // Pour screenresolution ou autres
      }

      // Étapes suivantes basées sur le type de matériel et la navigation précédente
      const lastStep = navigationPath[navigationPath.length - 1];

      if (type === "gpu") {
        if (lastStep === "brand") return "generation";
        return "results";
      }

      if (type === "cpu") {
        if (lastStep === "brand") return "range";
        if (lastStep === "range") return "generation";
        return "results";
      }

      // Par défaut, montrer les résultats
      return "results";
    })();

    // Si nous sommes à l'étape des résultats, retourner un tableau vide
    if (currentStep === "results") {
      return [];
    }

    // Extraire les options uniques pour l'étape actuelle
    const options = Array.from(new Set(
      filteredItems.map(item => item[currentStep as keyof HardwareItem])
    )).filter(Boolean) as string[];

    return options.sort();
  }, [items, type, navigationPath, filters, searchQuery]);

  // Détermine le type d'étape courante
  const currentStepType = useMemo(() => {
    if (searchQuery) return "search";
    if (navigationPath.length === 0) {
      if (type === "gpu" || type === "cpu") return "brand";
      if (type === "ram") return "type";
      return "results";
    }

    const lastStep = navigationPath[navigationPath.length - 1];
    if (lastStep === "generation" ||
      (type === "ram" && lastStep === "type") ||
      type === "screenresolution") {
      return "results";
    }

    if (lastStep === "brand") {
      return type === "cpu" ? "range" : "generation";
    }

    if (lastStep === "range") {
      return "generation";
    }

    return "results";
  }, [navigationPath, type, searchQuery]);
  
  // Résultats filtrés pour affichage final
  const filteredResults = useMemo(() => {
    // Si on est en mode recherche
    if (searchQuery) {
      return items.filter(item =>
        item.libelle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.generation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.range?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.width && item.height && `${item.width}x${item.height}`.toLowerCase().includes(searchQuery.toLowerCase()))
      ).sort((a, b) => a.libelle.localeCompare(b.libelle));
    }

    // Si on est à l'étape des résultats
    if (currentStepType === "results") {
      let filteredItems = [...items];

      // Appliquer les filtres existants
      Object.entries(filters).forEach(([key, value]) => {
        filteredItems = filteredItems.filter(item => item[key as keyof HardwareItem] === value);
      });

      return filteredItems.sort((a, b) => a.libelle.localeCompare(b.libelle));
    }

    return [];
  }, [items, type, navigationPath, filters, searchQuery, currentStepType]);

  // Obtenir le titre de l'étape actuelle
  const getCurrentStepTitle = () => {
    if (searchQuery) return "Résultats de recherche";
    
    if (currentStepType === "results") {
      return "Sélectionnez un élément";
    }
    
    switch (currentStepType) {
      case "brand":
        return "Choisissez votre marque";
      case "generation":
        return "Choisissez votre génération";
      case "range":
        return "Choisissez votre gamme";
      case "type":
        return "Choisissez votre type";
      default:
        return "Choisissez une option";
    }
  };

  // Afficher les détails d'un élément
  const renderItemDetails = (item: HardwareItem) => {
    switch (type) {
      case "gpu":
        return (
          <span className="text-gray-500 text-sm">
            {item.brand} {item.generation ? `- ${item.generation}` : ""}
          </span>
        );
      case "cpu":
        return (
          <span className="text-gray-500 text-sm">
            {item.brand} {item.range ? `${item.range}` : ""} {item.generation ? `- ${item.generation}` : ""}
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

  // Afficher les informations sur la sélection courante
  const renderSelectionInfo = () => {
    if (Object.keys(filters).length === 0) return null;

    const selectionParts = Object.values(filters);

    return (
      <div className="text-sm text-gray-600 mb-3">
        Sélection actuelle: {selectionParts.join(' › ')}
      </div>
    );
  };

  // Afficher le contenu principal du dialogue
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      );
    }

    // Afficher le titre de l'étape actuelle
    const stepTitle = getCurrentStepTitle();

    return (
      <>
        <h3 className="text-md font-medium mb-3 text-gray-700">{stepTitle}</h3>
        
        {/* Mode navigation par options */}
        {currentStepType !== "results" && currentStepType !== "search" && (
          renderOptions(availableNavigationOptions)
        )}
        
        {/* Mode résultats ou recherche */}
        {(currentStepType === "results" || searchQuery) && (
          renderItems(filteredResults)
        )}
      </>
    );
  };

  // Afficher les options de navigation
  const renderOptions = (options: string[]) => {
    if (options.length === 0) {
      return (
        <p className="text-center py-4 text-gray-500">
          Aucune option disponible
        </p>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center"
            onClick={() => addNavigationStep(currentStepType, option)}
          >
            <span className="font-medium">{option}</span>
          </Button>
        ))}
      </div>
    );
  };

  // Afficher les éléments finaux
  const renderItems = (itemsList: HardwareItem[]) => {
    if (itemsList.length === 0) {
      return (
        <p className="text-center py-4 text-gray-500">
          Aucun élément trouvé
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {itemsList.map((item) => (
          <Button
            key={item._id}
            variant="ghost"
            className="w-full justify-start flex items-start hover:bg-gray-100"
            onClick={() => handleSelectItem(item)}
          >
            <span className="font-medium">{item.libelle}</span>
            {renderItemDetails(item)}
          </Button>
        ))}
      </div>
    );
  };

  // Détermine si le bouton retour doit être affiché
  const shouldShowBackButton = navigationPath.length > 0 || searchQuery !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center">
          {shouldShowBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8"
              onClick={goBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Barre de recherche globale */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Rechercher un ${type}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {renderSelectionInfo()}

        <div className="max-h-96 overflow-y-auto">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HardwareSelectDialog;