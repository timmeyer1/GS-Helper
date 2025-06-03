'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogScreenshot,
} from '@/components/ui/dialog'; // Ton nouveau Dialog custom
import { Button } from '@/components/ui/button';

interface Screenshot {
    id: number;
    image_id: string;
}

interface ScreenshotGalleryProps {
    gameName: string;
    screenshots: Screenshot[];
}

const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({
    gameName,
    screenshots,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openModal = (index: number) => {
        setCurrentIndex(index);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? screenshots.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prev) =>
            prev === screenshots.length - 1 ? 0 : prev + 1
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        else if (e.key === 'ArrowRight') goToNext();
        else if (e.key === 'Escape') closeModal();
    };

    if (!screenshots || screenshots.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500">
                    Aucune capture d'écran disponible pour ce jeu.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Miniatures */}
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

            {/* Modale plein écran avec composant Dialog custom */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogScreenshot onKeyDown={handleKeyDown}>
                    <div className="relative w-full h-full">
                        <Image
                            src={`https://images.igdb.com/igdb/image/upload/t_1080p/${screenshots[currentIndex].image_id}.jpg`}
                            alt={`Screenshot de ${gameName}`}
                            fill
                            className="object-contain"
                            priority
                            quality={100}
                            sizes="(max-width: 3840px) 3840px, 100vw"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-50"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-50"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </Button>

                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 text-white px-3 py-1 rounded text-sm">
                            {currentIndex + 1} / {screenshots.length}
                        </div>
                    </div>
                </DialogScreenshot>
            </Dialog>

        </>
    );
};

export default ScreenshotGallery;

