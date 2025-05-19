import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Interface pour les screenshots
interface Screenshot {
    id: number;
    image_id: string;
}

// Props du composant
interface ScreenshotGalleryProps {
    gameName: string;
    screenshots: Screenshot[];
}

const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ gameName, screenshots }) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Gestion de l'ouverture de la modale pour une image spécifique
    const openModal = (index: number) => {
        setCurrentIndex(index);
        setShowModal(true);
    };

    // Navigation vers l'image précédente
    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? screenshots.length - 1 : prevIndex - 1
        );
    };

    // Navigation vers l'image suivante
    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Gestion des touches du clavier pour la navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        } else if (e.key === 'Escape') {
            setShowModal(false);
        }
    };

    // Si aucun screenshot n'est disponible
    if (!screenshots || screenshots.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500">Aucune capture d'écran disponible pour ce jeu.</p>
            </div>
        );
    }

    return (
        <>
            {/* Grille des miniatures de captures d'écran */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {screenshots.map((screenshot, index) => (
                    <div
                        key={screenshot.id}
                        className="relative aspect-video rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openModal(index)}
                    >
                        <Image
                            src={`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`}
                            alt={`Screenshot de ${gameName}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Modale pour afficher les images en plein écran */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-5xl p-0 h-screen max-h-[90vh] flex flex-col" onKeyDown={handleKeyDown}>
                    {/* En-tête avec bouton de fermeture */}
                    <div className="p-4 flex justify-between items-center">
                        <p className="text-sm font-medium">
                            {currentIndex + 1} / {screenshots.length}
                        </p>
                    </div>

                    {/* Contenu principal avec l'image */}
                    <div className="relative flex-1 w-[100%]">
                        {screenshots[currentIndex] && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Image
                                    src={`https://images.igdb.com/igdb/image/upload/t_original/${screenshots[currentIndex].image_id}.jpg`}
                                    alt={`Screenshot de ${gameName}`}
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>
                        )}

                        {/* Boutons de navigation */}
                        <div className="absolute inset-y-0 left-2 flex items-center">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={goToPrevious}
                                className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="absolute inset-y-0 right-2 flex items-center">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={goToNext}
                                className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ScreenshotGallery;