"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

// Interface pour les paramètres de configuration du jeu
interface GameSetting {
    name: string;
    options: string[];
    value: string;
}

// Interface pour les props du composant
interface CreatePostFormProps {
    gameId: number;
    gameName: string;
    userConfig: any | null;
    coverUrl?: string;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ gameId, gameName, userConfig, coverUrl }) => {
    const router = useRouter();
    const [content, setContent] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [gameSettings, setGameSettings] = useState<GameSetting[]>([
        { name: 'preset', options: ['Basse', 'Moyenne', 'Élevée', 'Ultra'], value: 'Moyenne' },
        { name: 'shadows', options: ['Désactivé', 'Basse', 'Moyenne', 'Élevée'], value: 'Moyenne' },
        { name: 'textures', options: ['Basse', 'Moyenne', 'Élevée', 'Ultra'], value: 'Élevée' },
        { name: 'antialiasing', options: ['Désactivé', 'FXAA', 'TAA', 'MSAA 2x', 'MSAA 4x'], value: 'TAA' },
        { name: 'resolution_scale', options: ['50%', '75%', '100%', '125%', '150%'], value: '100%' }
    ]);

    // Vérifier si l'utilisateur a une configuration
    useEffect(() => {
        if (!userConfig) {
            toast.error('Vous devez configurer votre matériel avant de publier', {
                description: 'Veuillez compléter votre profil d\'abord'
            });
        }
    }, [userConfig]);

    // Mettre à jour les settings à partir des gameSettings
    useEffect(() => {
        const newSettings: Record<string, string> = {};
        gameSettings.forEach(setting => {
            newSettings[setting.name] = setting.value;
        });
        setSettings(newSettings);
    }, [gameSettings]);

    // Fonction pour mettre à jour un paramètre spécifique
    const updateSetting = (name: string, value: string) => {
        setGameSettings(prevSettings =>
            prevSettings.map(setting =>
                setting.name === name ? { ...setting, value } : setting
            )
        );
    };

    // Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Veuillez ajouter du contenu à votre publication');
            return;
        }

        if (!userConfig) {
            toast.error('Configuration matérielle manquante');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId,
                    content,
                    settings
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Publication créée avec succès');
                // Rediriger vers la page du jeu ou rafraîchir les posts
                router.refresh();
                setContent('');
            } else {
                toast.error(data.error || 'Erreur lors de la création du post');
            }
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Publier vos réglages pour {gameName}</CardTitle>
                <CardDescription>
                    Partagez vos configurations optimales avec la communauté
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Prévisualisation de la configuration */}
                    {userConfig && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                            <h3 className="text-sm font-medium mb-2">Votre configuration</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>GPU: {userConfig.gpu_id?.libelle || "Non défini"}</div>
                                <div>CPU: {userConfig.cpu_id?.libelle || "Non défini"}</div>
                                <div>RAM: {userConfig.ram_id?.libelle || "Non défini"}</div>
                                <div>Résolution: {userConfig.screenresolution_id?.width}x{userConfig.screenresolution_id?.height || "Non défini"}</div>
                            </div>
                        </div>
                    )}

                    {/* Paramètres du jeu */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Paramètres du jeu</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gameSettings.map((setting) => (
                                <div key={setting.name} className="space-y-1">
                                    <Label htmlFor={setting.name} className="capitalize">
                                        {setting.name.replace('_', ' ')}
                                    </Label>
                                    <Select
                                        value={setting.value}
                                        onValueChange={(value) => updateSetting(setting.name, value)}
                                    >
                                        <SelectTrigger id={setting.name}>
                                            <SelectValue placeholder={`Sélectionner ${setting.name}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {setting.options.map(option => (
                                                <SelectItem key={`${setting.name}-${option}`} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contenu du post */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Votre expérience</Label>
                        <Textarea
                            id="content"
                            placeholder="Partagez votre expérience avec ces réglages (performances, qualité visuelle...)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !userConfig}>
                        {isSubmitting ? 'Publication...' : 'Publier'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreatePostForm;