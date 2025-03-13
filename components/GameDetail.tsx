// components/GameDetail.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Game = {
    id: number;
    name: string;
    summary?: string;
    cover?: { id: number; image_id: string };
    screenshots?: Array<{ id: number; image_id: string }>;
    genres?: Array<{ id: number; name: string }>;
    platforms?: Array<{ id: number; name: string }>;
    release_dates?: Array<{ id: number; date: number; human: string }>;
    rating?: number;
};

type Section = 'reglages' | 'screenshots';

export function GameDetail({ game }: { game: Game }) {
    const [activeSection, setActiveSection] = useState<Section>('reglages');

    const coverUrl = game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : '/placeholder-game.jpg';

    return (
        <div className="container mx-auto px-4 py-6">
            {/* En-tête avec nom du jeu et boutons de navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                {/* Nom du jeu et cover en petit */}
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-20 rounded overflow-hidden shadow">
                        <Image
                            src={coverUrl}
                            alt={game.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{game.name}</h1>
                        {game.release_dates && game.release_dates.length > 0 && (
                            <p className="text-xs text-gray-500">
                                Sortie le: {game.release_dates[0].human}
                            </p>
                        )}
                    </div>
                </div>

                {/* Boutons de navigation */}
                <div className="flex gap-3 mt-4 md:mt-0">
                    <Button
                        variant={activeSection === 'reglages' ? "default" : "outline"}
                        onClick={() => setActiveSection('reglages')}
                    >
                        Réglages
                    </Button>
                    <Button
                        variant={activeSection === 'screenshots' ? "default" : "outline"}
                        onClick={() => setActiveSection('screenshots')}
                    >
                        Screenshots
                    </Button>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Contenu principal */}
            <div className="grid grid-cols-1 gap-8">


                {/* Section Réglages */}
                {activeSection === 'reglages' && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Paramètres graphiques</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 border rounded-lg">
                                <h3 className="text-lg font-medium mb-3">Résolution</h3>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" className="justify-between">
                                        <span>1920 x 1080 (16:9)</span>
                                        <span className="text-sm text-gray-500">Recommandé</span>
                                    </Button>
                                    <Button variant="outline" className="justify-start">2560 x 1440 (16:9)</Button>
                                    <Button variant="outline" className="justify-start">3840 x 2160 (16:9)</Button>
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h3 className="text-lg font-medium mb-3">Qualité graphique</h3>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" className="justify-start">Basse</Button>
                                    <Button variant="outline" className="justify-between">
                                        <span>Moyenne</span>
                                        <span className="text-sm text-gray-500">Recommandé</span>
                                    </Button>
                                    <Button variant="outline" className="justify-start">Élevée</Button>
                                    <Button variant="outline" className="justify-start">Ultra</Button>
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h3 className="text-lg font-medium mb-3">Mode d'affichage</h3>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" className="justify-start">Plein écran</Button>
                                    <Button variant="outline" className="justify-start">Fenêtré</Button>
                                    <Button variant="outline" className="justify-start">Sans bordure</Button>
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h3 className="text-lg font-medium mb-3">Informations système</h3>
                                <div className="space-y-2 text-sm">
                                    {game.platforms && game.platforms.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="font-medium">Plateformes:</span>
                                            {game.platforms.map(platform => (
                                                <span key={platform.id} className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                                                    {platform.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {game.genres && game.genres.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="font-medium">Genres:</span>
                                            {game.genres.map(genre => (
                                                <span key={genre.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {game.rating && (
                                        <div className="flex items-center">
                                            <span className="font-medium mr-2">Note:</span>
                                            <div className="bg-green-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-xs">
                                                {Math.round(game.rating)}
                                            </div>
                                            <span className="ml-1 text-xs text-gray-500">/ 100</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {game.summary && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium mb-2">Résumé</h3>
                                <p className="text-gray-700">{game.summary}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Section Screenshots */}
                {activeSection === 'screenshots' && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Galerie de captures d'écran</h2>

                        {game.screenshots && game.screenshots.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {game.screenshots.map(screenshot => (
                                    <div
                                        key={screenshot.id}
                                        className="relative aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <Image
                                            src={`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`}
                                            alt={`Screenshot de ${game.name}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Aucune capture d'écran disponible.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}