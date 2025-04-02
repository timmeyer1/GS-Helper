// components/GameDetail.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

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
    // Nouveaux champs pour les exigences graphiques
    graphics_demand?: number; // 1-10, où 10 est très exigeant
};

type Section = 'reglages' | 'screenshots' | 'config';
type OptimizationMode = 'visuel' | 'performances';

// Base de données de jeux avec leur niveau d'exigence graphique (1-10)
// Cette base pourrait être stockée sur votre serveur ou dans une vraie base de données
const gameGraphicsDemands: Record<number, number> = {
    1: 3, // Valorant - peu exigeant
    2: 9, // Red Dead Redemption 2 - très exigeant
    3: 7, // Cyberpunk 2077 - exigeant
    4: 5, // Fortnite - modérément exigeant
    // etc.
};

// Composants PC disponibles
const gpuOptions = [
    { value: 'rtx4090', label: 'NVIDIA RTX 4090' },
    { value: 'rtx4080', label: 'NVIDIA RTX 4080' },
    { value: 'rtx3080', label: 'NVIDIA RTX 3080' },
    { value: 'rtx3070', label: 'NVIDIA RTX 3070' },
    { value: 'rtx3060', label: 'NVIDIA RTX 3060' },
    { value: 'rx7900xt', label: 'AMD Radeon RX 7900 XT' },
    { value: 'rx6900xt', label: 'AMD Radeon RX 6900 XT' },
    { value: 'rx6800xt', label: 'AMD Radeon RX 6800 XT' },
    { value: 'rx6700xt', label: 'AMD Radeon RX 6700 XT' },
];

const cpuOptions = [
    { value: 'i9-13900k', label: 'Intel Core i9-13900K' },
    { value: 'i7-13700k', label: 'Intel Core i7-13700K' },
    { value: 'i5-13600k', label: 'Intel Core i5-13600K' },
    { value: 'i9-12900k', label: 'Intel Core i9-12900K' },
    { value: 'i7-12700k', label: 'Intel Core i7-12700K' },
    { value: 'ryzen9-7950x', label: 'AMD Ryzen 9 7950X' },
    { value: 'ryzen7-7700x', label: 'AMD Ryzen 7 7700X' },
    { value: 'ryzen5-7600x', label: 'AMD Ryzen 5 7600X' },
    { value: 'ryzen9-5950x', label: 'AMD Ryzen 9 5950X' },
];

const ramOptions = [
    { value: '32gb', label: '32 Go' },
    { value: '16gb', label: '16 Go' },
    { value: '8gb', label: '8 Go' },
];

// Nouvelles options pour la résolution d'écran
const resolutionOptions = [
    { value: '1080p', label: '1920 x 1080 (Full HD)' },
    { value: '1440p', label: '2560 x 1440 (2K / QHD)' },
    { value: '4k', label: '3840 x 2160 (4K / UHD)' },
    { value: '720p', label: '1280 x 720 (HD)' },
    { value: 'ultrawide', label: '3440 x 1440 (Ultrawide)' },
];

export function GameDetail({ game }: { game: Game }) {
    const [activeSection, setActiveSection] = useState<Section>('reglages');
    const [optimizationMode, setOptimizationMode] = useState<OptimizationMode>('visuel');
    const [selectedGPU, setSelectedGPU] = useState<string>('');
    const [selectedCPU, setSelectedCPU] = useState<string>('');
    const [selectedRAM, setSelectedRAM] = useState<string>('');
    const [selectedResolution, setSelectedResolution] = useState<string>('');
    const [showRecommendations, setShowRecommendations] = useState<boolean>(false);

    const coverUrl = game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : '/placeholder-game.jpg';

    // Obtenir la difficulté graphique du jeu actuel
    const getGameDifficulty = (): number => {
        // Utiliser soit la propriété directe du jeu, soit la base de données, soit une valeur par défaut
        return game.graphics_demand || gameGraphicsDemands[game.id] || 5;
    };

    // Fonction pour générer des recommandations basées sur les composants et le mode
    const generateRecommendations = () => {
        // Vérifier que tous les composants sont sélectionnés
        if (!selectedGPU || !selectedCPU || !selectedRAM || !selectedResolution) {
            return null;
        }

        // Obtenir le niveau d'exigence graphique du jeu
        const gameDifficulty = getGameDifficulty();

        // Évaluer la puissance de la configuration
        const gpuTier = getGPUTier(selectedGPU);
        const cpuTier = getCPUTier(selectedCPU);
        const ramTier = getRAMTier(selectedRAM);

        // Appliquer un facteur de difficulté basé sur l'exigence du jeu
        // Plus le jeu est exigeant, plus on abaisse les recommandations
        const difficultyFactor = calculateDifficultyFactor(gameDifficulty);

        // Recommandations pour mode visuel (priorité à la qualité)
        if (optimizationMode === 'visuel') {
            return {
                resolution: getVisualResolution(gpuTier, difficultyFactor, selectedResolution),
                qualite: getVisualQuality(gpuTier, cpuTier, difficultyFactor),
                fps: getVisualFPS(gpuTier, cpuTier, ramTier, difficultyFactor),
                aaMode: getVisualAA(gpuTier, difficultyFactor),
                shadows: getVisualShadows(gpuTier, cpuTier, difficultyFactor),
                textures: getVisualTextures(gpuTier, ramTier, difficultyFactor),
                drawDistance: getVisualDrawDistance(gpuTier, difficultyFactor),
                reflections: getVisualReflections(gpuTier, difficultyFactor),
                ambient: getVisualAmbient(gpuTier, cpuTier, difficultyFactor),
            };
        }
        // Recommandations pour mode performances (priorité aux FPS)
        else {
            return {
                resolution: getPerformanceResolution(gpuTier, difficultyFactor, selectedResolution),
                qualite: getPerformanceQuality(gpuTier, cpuTier, difficultyFactor),
                fps: getPerformanceFPS(gpuTier, cpuTier, difficultyFactor),
                aaMode: getPerformanceAA(gpuTier, difficultyFactor),
                shadows: getPerformanceShadows(gpuTier, difficultyFactor),
                textures: getPerformanceTextures(ramTier, difficultyFactor),
                drawDistance: getPerformanceDrawDistance(difficultyFactor),
                reflections: getPerformanceReflections(difficultyFactor),
                ambient: getPerformanceAmbient(difficultyFactor),
            };
        }
    };

    // Calcul du facteur de difficulté (réduit la valeur des tiers en fonction de l'exigence du jeu)
    const calculateDifficultyFactor = (difficulty: number): number => {
        // Normaliser entre 0 et 1, où 1 signifie "pas de réduction" et 0 serait "réduction totale"
        return Math.max(0, 1 - (difficulty / 10));
    };

    // Fonctions d'évaluation des tiers (simplifiées pour l'exemple)
    const getGPUTier = (gpu: string): number => {
        const topTier = ['rtx4090'];
        const highTier = ['rtx4080', 'rx7900xt'];
        const upperMidTier = ['rtx3080', 'rx6900xt'];
        const midTier = ['rtx3070', 'rx6800xt'];

        if (topTier.includes(gpu)) return 4;
        if (highTier.includes(gpu)) return 3;
        if (upperMidTier.includes(gpu)) return 2.5;
        if (midTier.includes(gpu)) return 2;
        return 1;
    };

    const getCPUTier = (cpu: string): number => {
        const topTier = ['i9-13900k', 'ryzen9-7950x'];
        const highTier = ['i7-13700k', 'ryzen7-7700x', 'i9-12900k'];
        const midTier = ['i5-13600k', 'ryzen5-7600x', 'i7-12700k', 'ryzen9-5950x'];

        if (topTier.includes(cpu)) return 4;
        if (highTier.includes(cpu)) return 3;
        if (midTier.includes(cpu)) return 2;
        return 1;
    };

    const getRAMTier = (ram: string): number => {
        if (ram === '32gb') return 3;
        if (ram === '16gb') return 2;
        return 1;
    };

    // Ajustement en fonction de la résolution d'écran
    const getResolutionImpact = (resolution: string): number => {
        switch (resolution) {
            case '4k': return 0.5; // Réduction significative des performances
            case '1440p': return 0.8; // Réduction modérée
            case 'ultrawide': return 0.7; // Entre 1440p et 4K
            case '720p': return 1.2; // Augmentation des performances
            case '1080p':
            default:
                return 1.0; // Base de référence
        }
    };

    // Recommandations pour le mode visuel avec ajustements pour la difficulté du jeu
    const getVisualResolution = (gpuTier: number, difficultyFactor: number, userResolution: string): string => {
        // Calculer la puissance effective du GPU considérant la difficulté du jeu
        const effectiveGpuTier = gpuTier * difficultyFactor;

        // Si l'écran est 4K mais que le GPU est trop faible pour le jeu, recommander une résolution inférieure
        if (userResolution === '4k' && effectiveGpuTier < 2.5) {
            return '1440p (mise à l\'échelle pour 4K)';
        }

        // Si l'écran est 1440p mais que le GPU est trop faible pour le jeu, recommander une résolution inférieure
        if (userResolution === '1440p' && effectiveGpuTier < 1.5) {
            return '1080p (mise à l\'échelle pour 1440p)';
        }

        // Pour les ultrawide
        if (userResolution === 'ultrawide' && effectiveGpuTier < 2) {
            return '2560 x 1080 (ultrawide réduit)';
        }

        // Sinon, recommander la résolution native
        switch (userResolution) {
            case '4k': return '3840 x 2160 (4K natif)';
            case '1440p': return '2560 x 1440 (2K natif)';
            case 'ultrawide': return '3440 x 1440 (Ultrawide natif)';
            case '720p': return '1280 x 720 (HD natif)';
            case '1080p':
            default:
                return '1920 x 1080 (Full HD natif)';
        }
    };

    const getVisualQuality = (gpuTier: number, cpuTier: number, difficultyFactor: number): string => {
        // Combinaison pondérée du GPU (75%) et CPU (25%) avec facteur de difficulté
        const combinedTier = ((gpuTier * 0.75) + (cpuTier * 0.25)) * difficultyFactor;

        if (combinedTier >= 3) return 'Ultra';
        if (combinedTier >= 2) return 'Élevée';
        if (combinedTier >= 1.5) return 'Moyenne';
        return 'Basse';
    };

    const getVisualFPS = (gpuTier: number, cpuTier: number, ramTier: number, difficultyFactor: number): string => {
        // Combinaison pondérée des composants avec facteur de difficulté
        const weightedGpu = gpuTier * 0.6; // 60% influence
        const weightedCpu = cpuTier * 0.3; // 30% influence
        const weightedRam = ramTier * 0.1; // 10% influence

        const combinedTier = (weightedGpu + weightedCpu + weightedRam) * difficultyFactor;

        if (combinedTier >= 3) return '60+ FPS stable';
        if (combinedTier >= 2) return '45-60 FPS';
        if (combinedTier >= 1.5) return '30-45 FPS';
        return 'Sous 30 FPS (considérez réduire les paramètres)';
    };

    const getVisualAA = (gpuTier: number, difficultyFactor: number): string => {
        const effectiveTier = gpuTier * difficultyFactor;

        if (effectiveTier >= 3.5) return 'MSAA 8x ou TAA Haute Qualité';
        if (effectiveTier >= 2.5) return 'MSAA 4x ou TAA';
        if (effectiveTier >= 1.5) return 'FXAA ou TAA Basse Qualité';
        return 'Désactivé ou FXAA';
    };

    const getVisualShadows = (gpuTier: number, cpuTier: number, difficultyFactor: number): string => {
        // Les ombres dépendent à la fois du GPU et du CPU
        const combinedTier = ((gpuTier * 0.7) + (cpuTier * 0.3)) * difficultyFactor;

        if (combinedTier >= 3) return 'Ultra (ombres volumétriques)';
        if (combinedTier >= 2) return 'Élevée';
        if (combinedTier >= 1.5) return 'Moyenne';
        return 'Basse';
    };

    const getVisualTextures = (gpuTier: number, ramTier: number, difficultyFactor: number): string => {
        // Les textures dépendent du GPU et de la RAM disponible
        const combinedTier = ((gpuTier * 0.4) + (ramTier * 0.6)) * difficultyFactor;

        if (combinedTier >= 3) return 'Ultra (4K)';
        if (combinedTier >= 2) return 'Élevée (2K)';
        if (combinedTier >= 1.5) return 'Moyenne (1K)';
        return 'Basse (512px)';
    };

    const getVisualDrawDistance = (gpuTier: number, difficultyFactor: number): string => {
        const effectiveTier = gpuTier * difficultyFactor;

        if (effectiveTier >= 3) return 'Ultra';
        if (effectiveTier >= 2) return 'Élevée';
        if (effectiveTier >= 1.5) return 'Moyenne';
        return 'Basse';
    };

    const getVisualReflections = (gpuTier: number, difficultyFactor: number): string => {
        const effectiveTier = gpuTier * difficultyFactor;

        if (effectiveTier >= 3.5) return 'Ray Tracing Élevé';
        if (effectiveTier >= 2.5) return 'Ray Tracing Bas ou SSR Élevé';
        if (effectiveTier >= 1.8) return 'SSR (Screen Space Reflections)';
        if (effectiveTier >= 1.2) return 'Réflexions Simples';
        return 'Désactivées';
    };

    const getVisualAmbient = (gpuTier: number, cpuTier: number, difficultyFactor: number): string => {
        const combinedTier = ((gpuTier * 0.8) + (cpuTier * 0.2)) * difficultyFactor;

        if (combinedTier >= 3) return 'Ultra (SSAO, occlusion globale)';
        if (combinedTier >= 2) return 'Élevée (SSAO)';
        if (combinedTier >= 1.5) return 'Moyenne (AO basique)';
        return 'Désactivée';
    };

    // Recommandations pour le mode performances
    const getPerformanceResolution = (gpuTier: number, difficultyFactor: number, userResolution: string): string => {
        const effectiveGpuTier = gpuTier * difficultyFactor;

        // En mode performance, on réduit souvent la résolution d'un cran pour privilégier les FPS
        if (userResolution === '4k') {
            if (effectiveGpuTier >= 3.5) return '3840 x 2160 (4K natif)';
            return '1440p (mise à l\'échelle pour 4K)';
        }

        if (userResolution === '1440p') {
            if (effectiveGpuTier >= 2.5) return '2560 x 1440 (2K natif)';
            return '1080p (mise à l\'échelle pour 1440p)';
        }

        if (userResolution === 'ultrawide') {
            if (effectiveGpuTier >= 3) return '3440 x 1440 (Ultrawide natif)';
            return '2560 x 1080 (Ultrawide réduit)';
        }

        // Pour 1080p ou 720p, on reste généralement à la résolution native
        return userResolution === '720p' ? '1280 x 720 (HD natif)' : '1920 x 1080 (Full HD natif)';
    };

    const getPerformanceQuality = (gpuTier: number, cpuTier: number, difficultyFactor: number): string => {
        const combinedTier = ((gpuTier * 0.75) + (cpuTier * 0.25)) * difficultyFactor;

        if (combinedTier >= 3.5) return 'Élevée';
        if (combinedTier >= 2.5) return 'Moyenne';
        return 'Basse';
    };

    const getPerformanceFPS = (gpuTier: number, cpuTier: number, difficultyFactor: number): string => {
        const combinedTier = ((gpuTier * 0.6) + (cpuTier * 0.4)) * difficultyFactor;

        if (combinedTier >= 3.5) return '144+ FPS';
        if (combinedTier >= 2.5) return '100-120 FPS';
        if (combinedTier >= 1.8) return '60-90 FPS';
        return '30-60 FPS';
    };

    const getPerformanceAA = (gpuTier: number, difficultyFactor: number): string => {
        const effectiveTier = gpuTier * difficultyFactor;

        if (effectiveTier >= 3.5) return 'FXAA ou TAA Basse Qualité';
        return 'Désactivé';
    };

    const getPerformanceShadows = (gpuTier: number, difficultyFactor: number): string => {
        const effectiveTier = gpuTier * difficultyFactor;

        if (effectiveTier >= 3.5) return 'Moyenne';
        if (effectiveTier >= 2.5) return 'Basse';
        return 'Très Basse ou Désactivées';
    };

    const getPerformanceTextures = (ramTier: number, difficultyFactor: number): string => {
        const effectiveTier = ramTier * difficultyFactor;

        if (effectiveTier >= 2.5) return 'Moyenne';
        return 'Basse';
    };

    const getPerformanceDrawDistance = (difficultyFactor: number): string => {
        if (difficultyFactor >= 0.8) return 'Moyenne';
        return 'Basse';
    };

    const getPerformanceReflections = (difficultyFactor: number): string => {
        if (difficultyFactor >= 0.9) return 'Simples';
        return 'Désactivées';
    };

    const getPerformanceAmbient = (difficultyFactor: number): string => {
        if (difficultyFactor >= 0.8) return 'Basse';
        return 'Désactivée';
    };

    const recommendations = showRecommendations ? generateRecommendations() : null;

    // Obtenir le niveau de difficulté actuel pour l'affichage
    const gameDifficulty = getGameDifficulty();
    const difficultyText = () => {
        if (gameDifficulty >= 8) return "Très exigeant";
        if (gameDifficulty >= 6) return "Exigeant";
        if (gameDifficulty >= 4) return "Modéré";
        return "Peu exigeant";
    };

    // Obtenir une couleur en fonction de la difficulté
    const difficultyColor = () => {
        if (gameDifficulty >= 8) return "text-red-600";
        if (gameDifficulty >= 6) return "text-orange-500";
        if (gameDifficulty >= 4) return "text-yellow-500";
        return "text-green-500";
    };

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
                        <div className="flex items-center gap-2">
                            {game.release_dates && game.release_dates.length > 0 && (
                                <p className="text-xs text-gray-500">
                                    Sortie le: {game.release_dates[0].human}
                                </p>
                            )}
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
                                Exigence graphique: <span className={difficultyColor()}>{difficultyText()}</span>
                            </span>
                        </div>
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
                        variant={activeSection === 'config' ? "default" : "outline"}
                        onClick={() => setActiveSection('config')}
                    >
                        Optimisation PC
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
                    </div>
                )}

                {/* Section Optimisation PC */}
                {activeSection === 'config' && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Optimisation pour votre configuration</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sélection des composants */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Votre configuration</CardTitle>
                                    <CardDescription>
                                        Entrez les détails de votre PC pour obtenir des recommandations personnalisées
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Carte graphique (GPU)
                                        </label>
                                        <Select
                                            value={selectedGPU}
                                            onValueChange={setSelectedGPU}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez votre GPU" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gpuOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Processeur (CPU)
                                        </label>
                                        <Select
                                            value={selectedCPU}
                                            onValueChange={setSelectedCPU}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez votre CPU" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cpuOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Mémoire (RAM)
                                        </label>
                                        <Select
                                            value={selectedRAM}
                                            onValueChange={setSelectedRAM}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez votre RAM" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ramOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Résolution d'écran
                                        </label>
                                        <Select
                                            value={selectedResolution}
                                            onValueChange={setSelectedResolution}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez votre résolution" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {resolutionOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="text-sm font-medium mb-2">Mode d'optimisation</h4>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={optimizationMode === 'visuel' ? "default" : "outline"}
                                                onClick={() => setOptimizationMode('visuel')}
                                                className="flex-1"
                                            >
                                                Visuel
                                            </Button>
                                            <Button
                                                variant={optimizationMode === 'performances' ? "default" : "outline"}
                                                onClick={() => setOptimizationMode('performances')}
                                                className="flex-1"
                                            >
                                                Performances
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={() => setShowRecommendations(true)}
                                        disabled={!selectedGPU || !selectedCPU || !selectedRAM || !selectedResolution}
                                    >
                                        Générer les recommandations
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Affichage des recommandations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {optimizationMode === 'visuel'
                                            ? 'Paramètres recommandés pour qualité visuelle'
                                            : 'Paramètres recommandés pour performances'}
                                    </CardTitle>
                                    <CardDescription>
                                        {optimizationMode === 'visuel'
                                            ? 'Configuré pour maximiser la qualité graphique tout en maintenant des performances acceptables'
                                            : 'Configuré pour maximiser les FPS et la fluidité du jeu'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!showRecommendations ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <p>Veuillez entrer votre configuration et générer les recommandations</p>
                                        </div>
                                    ) : recommendations ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-2 border rounded-lg">
                                                    <h4 className="text-xs font-semibold text-gray-500">RÉSOLUTION</h4>
                                                    <p className="font-medium">{recommendations.resolution}</p>
                                                </div>
                                                <div className="p-2 border rounded-lg">
                                                    <h4 className="text-xs font-semibold text-gray-500">QUALITÉ GLOBALE</h4>
                                                    <p className="font-medium">{recommendations.qualite}</p>
                                                </div>
                                            </div>

                                            <div className="p-2 border rounded-lg">
                                                <h4 className="text-xs font-semibold text-gray-500">PERFORMANCES ATTENDUES</h4>
                                                <p className="font-medium">{recommendations.fps}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-medium">Paramètres détaillés</h4>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        <tr className="border-b">
                                                            <td className="py-2 text-gray-500">Anti-aliasing</td>
                                                            <td className="py-2 font-medium text-right">{recommendations.aaMode}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="py-2 text-gray-500">Ombres</td>
                                                            <td className="py-2 font-medium text-right">{recommendations.shadows}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="py-2 text-gray-500">Textures</td>
                                                            <td className="py-2 font-medium text-right">{recommendations.textures}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="py-2 text-gray-500">Distance d'affichage</td>
                                                            <td className="py-2 font-medium text-right">{recommendations.drawDistance}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="py-2 text-gray-500">Réflexions</td>
                                                            <td className="py-2 font-medium text-right">{recommendations.reflections}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-2 text-gray-500">Occlusion ambiante</td>
                                                            <td className="py-2 font-medium text-right">{recommendations.ambient}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-sm text-blue-700">
                                                    Ces paramètres sont optimisés pour votre configuration et
                                                    {optimizationMode === 'visuel'
                                                        ? ' privilégient la qualité visuelle.'
                                                        : ' privilégient les performances et la fluidité.'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-red-500">
                                            <p>Impossible de générer des recommandations. Veuillez vérifier votre configuration.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Section Screenshots */}
                {activeSection === 'screenshots' && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Screenshots et média</h2>

                        {game.screenshots && game.screenshots.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {game.screenshots.map(screenshot => (
                                    <div key={screenshot.id} className="relative h-48 rounded-lg overflow-hidden">
                                        <Image
                                            src={`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`}
                                            alt={`Screenshot de ${game.name}`}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Aucun screenshot disponible pour ce jeu.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Résumé du jeu en bas */}
            {game.summary && (
                <div className="mt-8">
                    <Separator className="mb-4" />
                    <h3 className="text-lg font-medium mb-2">À propos de {game.name}</h3>
                    <p className="text-gray-700">{game.summary}</p>
                </div>
            )}
        </div>
    );
}