"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { useSession } from "next-auth/react";
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import GuestHardwareConfig from './user/GuestHardwareConfig';

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

    // Récupération des options de matériel
    useEffect(() => {
        const fetchHardwareOptions = async () => {
            try {
                const [gpuRes, cpuRes, ramRes, resolutionRes] = await Promise.all([
                    fetch("/api/hardware/gpu"),
                    fetch("/api/hardware/cpu"),
                    fetch("/api/hardware/ram"),
                    fetch("/api/hardware/resolution")
                ]);

                if (!gpuRes.ok || !cpuRes.ok || !ramRes.ok || !resolutionRes.ok) {
                    throw new Error("Erreur lors de la récupération des options matérielles");
                }

                const [gpus, cpus, rams, resolutions] = await Promise.all([
                    gpuRes.json(),
                    cpuRes.json(),
                    ramRes.json(),
                    resolutionRes.json()
                ]);

                setHardwareOptions({
                    gpus: gpus.data || [],
                    cpus: cpus.data || [],
                    rams: rams.data || [],
                    resolutions: resolutions.data || []
                });
            } catch (err) {
                console.error("Erreur lors de la récupération des options matérielles:", err);
            }
        };

        fetchHardwareOptions();
    }, []);

    // Affichage pendant le chargement
    if (status === "loading" || loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col justify-center items-center min-h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                    <p className="text-lg text-gray-600">Chargement des données...</p>
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
                    <h2 className="text-2xl font-semibold mb-4">Votre configuration pour {game.name}</h2>

                    {status === "unauthenticated" ? (
                        <GuestHardwareConfig 
                            hardwareOptions={hardwareOptions} 
                            gameName={game.name}
                        />
                    ) : error ? (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {error}.
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-white underline ml-1"
                                    onClick={() => router.push('/profile')}
                                >
                                    Compléter mon profil
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Votre configuration détectée</CardTitle>
                                <CardDescription>
                                    Configuration matérielle récupérée depuis votre profil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {userConfig && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Carte graphique:</span>
                                            <span>{userConfig.gpu_id?.libelle || "Non configuré"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Processeur:</span>
                                            <span>{userConfig.cpu_id?.libelle || "Non configuré"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Mémoire RAM:</span>
                                            <span>{userConfig.ram_id?.libelle || "Non configuré"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Résolution d'écran:</span>
                                            <span>
                                                {userConfig.screenresolution_id?.width}x{userConfig.screenresolution_id?.height}
                                                {userConfig.screenresolution_id?.libelle ? ` (${userConfig.screenresolution_id?.libelle})` : ''}
                                            </span>
                                        </div>

                                        <div className="text-xs text-gray-500 mt-4">
                                            <p>
                                                Vous pouvez modifier votre configuration matérielle dans votre
                                                <span
                                                    className="font-medium cursor-pointer text-purple-600 ml-1"
                                                    onClick={() => router.push('/profile')}
                                                >
                                                    profil
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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

                    {game.screenshots && game.screenshots.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {game.screenshots.map((screenshot) => (
                                <div
                                    key={screenshot.id}
                                    className="relative aspect-video rounded-lg overflow-hidden shadow-md"
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
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <p className="text-gray-500">Aucune capture d'écran disponible pour ce jeu.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}