import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { PostsCard } from './posts/PostsCard';

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

// Props du composant
interface GuestHardwareConfigProps {
    hardwareOptions: {
        gpus: HardwareItem[];
        cpus: HardwareItem[];
        rams: HardwareItem[];
        resolutions: HardwareItem[];
    };
    gameName: string;
    gameId?: number;
}

const GuestHardwareConfig: React.FC<GuestHardwareConfigProps> = ({ hardwareOptions, gameName, gameId }) => {
    const router = useRouter();
    const [localConfig, setLocalConfig] = useState<UserConfig>({});

    // Charger la config locale du localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem('localHardwareConfig');
        if (savedConfig) {
            try {
                setLocalConfig(JSON.parse(savedConfig));
            } catch (err) {
                console.error("Erreur lors de la lecture de la configuration locale:", err);
            }
        }
    }, []);

    // Gérer le changement de matériel
    const handleHardwareChange = (type: keyof UserConfig, id: string) => {
        const hardwareMap = {
            gpu_id: hardwareOptions.gpus,
            cpu_id: hardwareOptions.cpus,
            ram_id: hardwareOptions.rams,
            screenresolution_id: hardwareOptions.resolutions
        };

        const selectedItem = hardwareMap[type].find(item => item.id === id);

        if (selectedItem) {
            const newConfig = {
                ...localConfig,
                [type]: selectedItem
            };

            setLocalConfig(newConfig);

            // Sauvegarder dans localStorage pour persistance
            localStorage.setItem('localHardwareConfig', JSON.stringify(newConfig));
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configuration pour {gameName}</CardTitle>
                    <CardDescription>
                        Choisissez votre configuration matérielle pour voir si vous pouvez faire tourner ce jeu
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* GPU */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Carte graphique</label>
                            <Select
                                value={localConfig.gpu_id?.id || ""}
                                onValueChange={(value) => handleHardwareChange("gpu_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une carte graphique" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hardwareOptions.gpus.map((gpu) => (
                                        <SelectItem key={gpu.id} value={gpu.id}>
                                            {gpu.libelle} {gpu.brand && gpu.generation ? `(${gpu.brand} ${gpu.generation})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* CPU */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Processeur</label>
                            <Select
                                value={localConfig.cpu_id?.id || ""}
                                onValueChange={(value) => handleHardwareChange("cpu_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un processeur" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hardwareOptions.cpus.map((cpu) => (
                                        <SelectItem key={cpu.id} value={cpu.id}>
                                            {cpu.libelle} {cpu.brand && cpu.generation ? `(${cpu.brand} ${cpu.generation})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* RAM */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mémoire RAM</label>
                            <Select
                                value={localConfig.ram_id?.id || ""}
                                onValueChange={(value) => handleHardwareChange("ram_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une RAM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hardwareOptions.rams.map((ram) => (
                                        <SelectItem key={ram.id} value={ram.id}>
                                            {ram.libelle} {ram.type ? `(${ram.type})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Résolution */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Résolution d'écran</label>
                            <Select
                                value={localConfig.screenresolution_id?.id || ""}
                                onValueChange={(value) => handleHardwareChange("screenresolution_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une résolution" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hardwareOptions.resolutions.map((res) => (
                                        <SelectItem key={res.id} value={res.id}>
                                            {res.width}x{res.height} {res.aspectRatio ? `(${res.aspectRatio})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                        <div className="text-sm text-gray-500">
                            Connectez-vous pour sauvegarder votre configuration
                        </div>
                        <Button onClick={() => router.push('/login')} variant="outline">
                            Se connecter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <PostsCard gameId={gameId} userConfig={localConfig} />
        </div>
    );
};

export default GuestHardwareConfig;
