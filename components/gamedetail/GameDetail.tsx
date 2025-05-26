"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import GuestHardwareConfig from './GuestUser';
import ConnectedUser from './ConnectedUser';
import ScreenshotGallery from './ScreenshotGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePostForm from '../posts/CreatePostForm';

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

export function GameDetail({ game }: { game: Game }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<Section>('config');
    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hardwareOptions, setHardwareOptions] = useState<{
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
            if (status === "authenticated" && session) {
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
            }
        };

        fetchUserConfig();
    }, [status, session]);

    // Affichage pendant le chargement avec Skeleton
    if (status === "loading" || loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-20 rounded" />
                        <div>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                <Separator className="my-4" />

                <Skeleton className="h-8 w-72 mb-4" />

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-full max-w-md mb-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-12 w-full mb-2" />
                                <Skeleton className="h-12 w-full mb-2" />
                                <Skeleton className="h-12 w-full mb-2" />
                                <Skeleton className="h-12 w-full mb-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-full max-w-sm" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* En-tête avec nom du jeu et boutons de navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-20 rounded overflow-hidden shadow">
                        {coverUrl ? (
                            <Image
                                src={coverUrl}
                                alt={game.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <Skeleton className="w-full h-full" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{game.name}</h1>
                        <div className="flex items-center gap-2">
                            {game.release_dates && game.release_dates.length > 0 && (
                                <p className="text-xs text-gray-500">
                                    Sortie le: {game.release_dates[0].human}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                    <Button
                        variant={activeSection === 'config' ? "default" : "outline"}
                        onClick={() => setActiveSection('config')}
                    >
                        Configuration PC
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
            {activeSection === 'config' && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{game.name} sur votre PC</h2>

                    {status === "unauthenticated" ? (
                        <GuestHardwareConfig
                            hardwareOptions={hardwareOptions}
                            gameName={game.name}
                        />
                    ) : (
                        <>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="config">Ma configuration</TabsTrigger>
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
                                    />
                                </TabsContent>
                            </Tabs>
                        </>
                    )}

                    {/* Description du jeu */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>À propos de {game.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">
                                {game.summary || "Aucune description disponible pour ce jeu."}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'screenshots' && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Captures d'écran</h2>
                    <ScreenshotGallery
                        gameName={game.name}
                        screenshots={game.screenshots || []}
                    />
                </div>
            )}
        </div>
    );
}