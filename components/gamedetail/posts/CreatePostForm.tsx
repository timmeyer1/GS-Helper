"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Setting {
    _id: string;
    name: string;
    display_name: string;
}

interface Preset {
    _id: string;
    name: 'Low' | 'Medium' | 'High' | 'Ultra';
    display_name: string;
}

interface CreatePostFormProps {
    gameId: number;
    gameName: string;
    userConfig: any | null;
    coverUrl?: string;
    onPostCreated?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({
    gameId, gameName, userConfig, onPostCreated
}) => {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('');
    const [expectedFps, setExpectedFps] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [customSettings, setCustomSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Charger les settings et presets
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, presetsRes] = await Promise.all([
                    fetch('/api/posts?settings=true'),
                    fetch('/api/posts?presets=true')
                ]);

                const [settingsData, presetsData] = await Promise.all([
                    settingsRes.json(),
                    presetsRes.json()
                ]);

                setSettings(settingsData.settings || []);
                setPresets(presetsData.presets || []);
            } catch (error) {
                console.error('Erreur chargement données:', error);
                toast.error('Erreur lors du chargement des paramètres');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePresetChange = (presetName: string) => {
        // Appliquer tous les settings avec la valeur du preset sélectionné
        const newSettings: Record<string, string> = {};
        settings.forEach(setting => {
            newSettings[setting.name] = presetName;
        });
        setCustomSettings(newSettings);
    };

    const handleSettingChange = (settingName: string, value: string) => {
        setCustomSettings(prev => ({ ...prev, [settingName]: value }));
    };

    // Vérifier si tous les settings sont remplis
    const areAllSettingsFilled = () => {
        return settings.every(setting => customSettings[setting.name] && customSettings[setting.name].trim() !== '');
    };

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

        if (!postType) {
            toast.error('Veuillez choisir le type de post');
            return;
        }

        if (!expectedFps) {
            toast.error('Veuillez indiquer les FPS attendus');
            return;
        }

        if (!areAllSettingsFilled()) {
            toast.error('Veuillez remplir tous les paramètres graphiques');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    content,
                    settings: customSettings,
                    postType,
                    expectedFps
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Publication créée avec succès');
                router.refresh();
                setContent('');
                setPostType('');
                setExpectedFps('');
                setCustomSettings({});
                onPostCreated?.();
            } else {
                toast.error(data.error || 'Erreur lors de la création du post');
            }
        } catch (error) {
            console.error('Erreur soumission:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Chargement...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (!userConfig) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Configuration requise</CardTitle>
                    <CardDescription>
                        Veuillez configurer votre matériel avant de publier
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

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
                    {/* Configuration utilisateur */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                        <h3 className="text-sm font-medium mb-2">Votre configuration</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>GPU: {userConfig.gpu_id?.libelle || "Non défini"}</div>
                            <div>CPU: {userConfig.cpu_id?.libelle || "Non défini"}</div>
                            <div>RAM: {userConfig.ram_id?.libelle || "Non défini"}</div>
                            <div>Résolution: {userConfig.screenresolution_id?.width}x{userConfig.screenresolution_id?.height || "Non défini"}</div>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Presets disponibles</Label>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {presets.map((preset) => (
                                <Button
                                    key={preset._id}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePresetChange(preset.name)}
                                    className="h-12"
                                >
                                    <div className="text-center">
                                        <div className="font-medium">{preset.display_name}</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Settings personnalisés */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.map((setting) => (
                                <div key={setting._id} className="space-y-1">
                                    <Label className="text-sm">{setting.display_name}</Label>
                                    <Select
                                        value={customSettings[setting.name] || ''}
                                        onValueChange={(value) => handleSettingChange(setting.name, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Faible</SelectItem>
                                            <SelectItem value="Medium">Moyen</SelectItem>
                                            <SelectItem value="High">Élevé</SelectItem>
                                            <SelectItem value="Ultra">Ultra</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Votre expérience</Label>
                        <Textarea
                            id="content"
                            placeholder="Partagez votre expérience avec ces réglages..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Type de post et FPS attendus */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="postType">Orientation du post</Label>
                            <Select value={postType} onValueChange={setPostType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equilibre">Équilibré</SelectItem>
                                    <SelectItem value="performance">Performance</SelectItem>
                                    <SelectItem value="qualite">Qualité</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expectedFps">FPS attendus</Label>
                            <Select value={expectedFps} onValueChange={setExpectedFps}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-60">Moins de 60 FPS</SelectItem>
                                    <SelectItem value="60-80">60-80 FPS</SelectItem>
                                    <SelectItem value="80-100">80-100 FPS</SelectItem>
                                    <SelectItem value="100-120">100-120 FPS</SelectItem>
                                    <SelectItem value="+120">Plus de 120 FPS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                </CardContent>

                <CardFooter className="flex justify-end">
                    <Button
                        variant="purple"
                        type="submit"
                        disabled={isSubmitting || !areAllSettingsFilled()}
                        className="cursor-pointer"
                    >
                        {isSubmitting ? 'Publication...' : 'Publier'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreatePostForm;