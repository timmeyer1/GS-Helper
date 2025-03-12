// components/GameDetail.tsx
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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

export function GameDetail({ game }: { game: Game }) {
    const coverUrl = game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : '/placeholder-game.jpg';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Image du jeu */}
                <div className="md:col-span-1">
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={coverUrl}
                            alt={game.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {game.platforms && game.platforms.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Plateformes</h3>
                            <div className="flex flex-wrap gap-2">
                                {game.platforms.map(platform => (
                                    <span key={platform.id} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                                        {platform.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Informations sur le jeu */}
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold mb-2">{game.name}</h1>

                    {game.release_dates && game.release_dates.length > 0 && (
                        <p className="text-sm text-gray-500 mb-4">
                            Sortie le: {game.release_dates[0].human}
                        </p>
                    )}

                    {game.rating && (
                        <div className="flex items-center mb-4">
                            <div className="bg-green-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center">
                                {Math.round(game.rating)}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">/ 100</span>
                        </div>
                    )}

                    {game.genres && game.genres.length > 0 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {game.genres.map(genre => (
                                    <span key={genre.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {game.summary && (
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">Résumé</h2>
                            <p className="text-gray-700">{game.summary}</p>
                        </div>
                    )}

                    {/* Galerie d'images */}
                    {game.screenshots && game.screenshots.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Screenshots</h2>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline">Voir la galerie</Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[80vh]">
                                    <SheetHeader>
                                        <SheetTitle>Captures d'écran de {game.name}</SheetTitle>
                                    </SheetHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto pb-8 h-full">
                                        {game.screenshots.map(screenshot => (
                                            <div key={screenshot.id} className="relative aspect-video rounded-lg overflow-hidden">
                                                <Image
                                                    src={`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`}
                                                    alt={`Screenshot de ${game.name}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}