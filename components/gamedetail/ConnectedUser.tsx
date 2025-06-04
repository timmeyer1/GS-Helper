import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "../ui/alert";
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
interface ConnectedUserProps {
    gameName: string;
    gameId?: number;
    error: string | null;
    userConfig: UserConfig | null;
}

const ConnectedUser: React.FC<ConnectedUserProps> = ({ gameName, gameId, error, userConfig }) => {
    const router = useRouter();

    return (
        <div>
            {error ? (
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
                // <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="">
                    <PostsCard gameId={gameId} userConfig={userConfig || undefined} />
                </div>
            )}
        </div>
    );
};

export default ConnectedUser;