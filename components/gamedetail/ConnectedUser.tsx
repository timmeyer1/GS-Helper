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
                    {/* <Card>
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
                    </Card> */}
                    <PostsCard gameId={gameId} userConfig={userConfig || undefined} />
                </div>
            )}
        </div>
    );
};

export default ConnectedUser;