"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '../ui/skeleton';
import { useSession } from "next-auth/react";
import GuestHardwareConfig from './GuestUser';
import ConnectedUser from './ConnectedUser';
import ScreenshotGallery from './ScreenshotGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePostForm from './posts/CreatePostForm';
import { SlidersHorizontal, Images, Calendar } from 'lucide-react';

// Types
type Game = {
    id: number;
    name: string;
    summary?: string;
    cover?: { image_id: string };
    screenshots?: Array<{ id: number; image_id: string }>;
    release_dates?: Array<{ human: string }>;
    graphics_demand?: number;
};

type Section = 'config' | 'screenshots';

// Interface pour les composants matériels
interface HardwareItem {
    id: string;
    libelle: string;
    type?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    brand?: string;
    generation?: string;
    range?: string;
}

// Interface pour la config utilisateur
interface UserConfig {
    gpu_id?: HardwareItem;
    cpu_id?: HardwareItem;
    ram_id?: HardwareItem;
    screenresolution_id?: HardwareItem;
}

// --- Squelettes de chargement, alignés sur la structure réelle ---

const SkeletonSection = ({ lines = 3 }: { lines?: number }) => (
    <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
    </div>
);

const SectionSkeletonCard = ({ lines = 3 }: { lines?: number }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200 bg-gray-50/60">
            <Skeleton className="h-7 w-48" />
        </div>
        <div className="p-5">
            <SkeletonSection lines={lines} />
        </div>
    </div>
);

const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-8 lg:p-12">
        <div className="container mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-20 rounded-lg shrink-0" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 md:h-10 md:w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <SectionSkeletonCard lines={4} />
            <SectionSkeletonCard lines={2} />
        </div>
    </div>
);

export function GameDetail({ game }: { game: Game }) {
    const { data: session, status } = useSession();
    const [activeSection, setActiveSection] = useState<Section>('config');
    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hardwareOptions] = useState<{
        gpus: HardwareItem[];
        cpus: HardwareItem[];
        rams: HardwareItem[];
        resolutions: HardwareItem[];
    }>({
        gpus: [],
        cpus: [],
        rams: [],
        resolutions: []
    });
    const [activeTab, setActiveTab] = useState<string>("config");

    // URL de la couverture du jeu
    const coverUrl = game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : '/placeholder-game.jpg';

    // Récupération de la configuration de l'utilisateur
    useEffect(() => {
        const fetchUserConfig = async () => {
            if (status !== "authenticated" || !session) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/user");
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données utilisateur");
                }

                const data = await response.json();
                setUserConfig(data.config);
            } catch (err) {
                console.error("Erreur:", err);
                setError("Impossible de charger votre configuration");
            } finally {
                setLoading(false);
            }
        };

        fetchUserConfig();
    }, [status, session]);

    if (status === "loading" || loading) return <PageSkeleton />;

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-8 lg:p-12">
            <div className="container mx-auto space-y-8">
                {/* En-tête */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-20 rounded-lg overflow-hidden shadow-sm shrink-0">
                            <Image
                                src={coverUrl}
                                alt={game.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{game.name}</h1>
                            {game.release_dates && game.release_dates.length > 0 && (
                                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Sortie le {game.release_dates[0].human}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant={activeSection === 'config' ? "default" : "outline"}
                            onClick={() => setActiveSection('config')}
                            className={activeSection !== 'config' ? "bg-white" : undefined}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1" />
                            Paramètres graphiques
                        </Button>
                        <Button
                            variant={activeSection === 'screenshots' ? "default" : "outline"}
                            onClick={() => setActiveSection('screenshots')}
                            className={activeSection !== 'screenshots' ? "bg-white" : undefined}
                        >
                            <Images className="h-4 w-4 mr-1" />
                            Screenshots
                        </Button>
                    </div>
                </header>

                {/* Paramètres graphiques */}
                {activeSection === 'config' && (
                    <>
                        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/60">
                                <h2 className="text-lg sm:text-xl font-semibold">{game.name} sur votre PC</h2>
                            </div>

                            <div className="p-5">
                                {status === "unauthenticated" ? (
                                    <GuestHardwareConfig
                                        hardwareOptions={hardwareOptions}
                                        gameName={game.name}
                                        gameId={game.id}
                                    />
                                ) : (
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="config">Liste des posts</TabsTrigger>
                                            <TabsTrigger value="create-post">Créer un post</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="config" className="mt-4">
                                            <ConnectedUser
                                                gameName={game.name}
                                                gameId={game.id}
                                                error={error}
                                                userConfig={userConfig}
                                            />
                                        </TabsContent>
                                        <TabsContent value="create-post" className="mt-4">
                                            <CreatePostForm
                                                gameId={game.id}
                                                gameName={game.name}
                                                userConfig={userConfig}
                                                coverUrl={coverUrl}
                                                onPostCreated={() => setActiveTab("config")}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </div>
                        </section>

                        {/* Description du jeu */}
                        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/60">
                                <h2 className="text-lg sm:text-xl font-semibold">À propos de {game.name}</h2>
                            </div>
                            <div className="p-5">
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                    {game.summary || "Aucune description disponible pour ce jeu."}
                                </p>
                            </div>
                        </section>
                    </>
                )}

                {/* Screenshots */}
                {activeSection === 'screenshots' && (
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/60">
                            <h2 className="text-lg sm:text-xl font-semibold">Captures d'écran</h2>
                        </div>
                        <div className="p-5">
                            <ScreenshotGallery
                                gameName={game.name}
                                screenshots={game.screenshots || []}
                            />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}