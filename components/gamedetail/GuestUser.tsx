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
        <div>
            <PostsCard gameId={gameId} userConfig={localConfig} />
        </div>
    );
};

export default GuestHardwareConfig;
