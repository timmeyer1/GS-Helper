"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UpvoteButton } from './UpvoteButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Target, Filter, ChevronDown, CircleEqual } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface UserConfig {
    gpu_id?: HardwareItem;
    cpu_id?: HardwareItem;
    ram_id?: HardwareItem;
    screenresolution_id?: HardwareItem;
}

interface Post {
    _id: string;
    user_id: {
        image: undefined;
        _id: string;
        name?: string;
        email?: string;
    };
    game_id: number;
    content: string;
    settings: Record<string, string>;
    votes: {
        upvotes: number;
        voters: Array<{ user_id: string }>;
    };
    hasUserVoted: boolean;
    created_at: string;
    postType: 'equilibre' | 'performance' | 'qualite';
    expectedFps: string;
}

type FilterType = 'tous' | 'equilibre' | 'performance' | 'qualite';

const FILTERS = {
    tous: { icon: Filter, label: 'Tous', color: '' },
    equilibre: { icon: CircleEqual, label: 'Équilibré', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    performance: { icon: Trophy, label: 'Performance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    qualite: { icon: Target, label: 'Qualité', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
};

// Mapping pour traduire les noms de settings
const SETTINGS_TRANSLATIONS: Record<string, string> = {
    viewDistance: 'Distance d\'affichage',
    antialiasing: 'Anticrénelage',
    shadows: 'Ombres',
    postProcessing: 'Post-traitement',
    texture: 'Textures',
    effects: 'Effets',
    foliage: 'Feuillage',
    lights: 'Éclairage'
};

// Mapping pour traduire les valeurs de settings
const SETTINGS_VALUES_TRANSLATIONS: Record<string, string> = {
    Low: 'Faible',
    Medium: 'Moyen',
    High: 'Élevé',
    Ultra: 'Ultra'
};

// Mapping pour traduire les FPS
const FPS_TRANSLATIONS: Record<string, string> = {
    '-60': 'Moins de 60 FPS',
    '60-80': '60-80 FPS',
    '80-100': '80-100 FPS',
    '100-120': '100-120 FPS',
    '+120': 'Plus de 120 FPS'
};

const PostTypeBadge: React.FC<{ type: keyof typeof FILTERS }> = ({ type }) => {
    const { icon: Icon, label, color } = FILTERS[type];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {label}
        </span>
    );
};

const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col justify-center items-center h-48 space-y-4 text-center">
        {children}
    </div>
);

const PostSkeleton = () => (
    <Card className="h-[320px]">
        <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-12 w-full" />
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    ))}
                </div>
            </div>
            <Skeleton className="h-4 w-20 ml-auto" />
        </CardContent>
    </Card>
);

export const PostsCard: React.FC<{ gameId?: number; userConfig?: UserConfig }> = ({
    gameId,
    userConfig
}) => {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('tous');

    const fetchPosts = useCallback(async () => {
        if (!gameId) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/posts?game_id=${gameId}&limit=6&sort=votes`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Erreur posts:', error);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleVoteChange = useCallback((postId: string, newUpvotes: number, hasUserVoted: boolean) => {
        setPosts(prev => prev.map(post =>
            post._id === postId
                ? { ...post, votes: { ...post.votes, upvotes: newUpvotes }, hasUserVoted }
                : post
        ).sort((a, b) => b.votes.upvotes - a.votes.upvotes));
    }, []);

    const truncateText = (text: string, maxLength: number = 100) =>
        text.length <= maxLength ? text : `${text.slice(0, maxLength).trim()}...`;

    const filteredPosts = posts.filter(post => filter === 'tous' || post.postType === filter);

    // Fonction pour traduire le nom d'un setting
    const translateSettingName = (settingName: string): string => {
        return SETTINGS_TRANSLATIONS[settingName] || settingName.replace('_', ' ');
    };

    // Fonction pour traduire la valeur d'un setting
    const translateSettingValue = (value: string): string => {
        return SETTINGS_VALUES_TRANSLATIONS[value] || value;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Posts populaires</CardTitle>
                    <CardDescription>Chargement des configurations...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <PostSkeleton key={i} />)}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const renderEmptyState = () => {
        if (!userConfig) {
            return (
                <EmptyState>
                    <p className="text-gray-500">Ajoutez votre configuration matérielle pour voir des recommandations</p>
                    <Button variant="outline" onClick={() => router.push('/profile')}>
                        Compléter mon profil
                    </Button>
                </EmptyState>
            );
        }

        if (filteredPosts.length === 0 && posts.length > 0) {
            return (
                <EmptyState>
                    <p className="text-gray-500">Aucun post trouvé pour le filtre "{FILTERS[filter].label}"</p>
                    <Button variant="outline" onClick={() => setFilter('tous')}>
                        Afficher tous les posts
                    </Button>
                </EmptyState>
            );
        }

        if (posts.length === 0) {
            return (
                <EmptyState>
                    <p className="text-gray-500">Aucun post disponible pour ce jeu</p>
                </EmptyState>
            );
        }

        return null;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Posts populaires</CardTitle>
                        <CardDescription>
                            {userConfig
                                ? 'Les configurations les mieux notées'
                                : 'Complétez votre profil pour voir des recommandations'}
                        </CardDescription>
                    </div>

                    {userConfig && posts.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 px-3">
                                    <Filter className="w-4 h-4" />
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                {Object.entries(FILTERS).map(([key, { icon: Icon, label }]) => (
                                    <DropdownMenuItem
                                        key={key}
                                        onClick={() => setFilter(key as FilterType)}
                                        className={`cursor-pointer ${filter === key ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {renderEmptyState() || (
                    <div className="space-y-4">
                        {filter !== 'tous' && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Filtré par :</span>
                                <PostTypeBadge type={filter} />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilter('tous')}
                                    className="h-6 px-2 text-xs"
                                >
                                    Tout afficher
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPosts.map((post) => (
                                <Link
                                    key={post._id}
                                    href={`/posts/${post._id}`}
                                    className="no-underline text-inherit"
                                >
                                    <Card
                                        key={post._id}
                                        className="h-[320px] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                                    >
                                        <CardContent className="p-4 h-full flex flex-col">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                                        <AvatarImage
                                                            src={post.user_id?.image}
                                                            alt={`Avatar de ${post.user_id?.name || 'utilisateur'}`}
                                                        />
                                                        <AvatarFallback className="bg-sky-700 text-white text-xs">
                                                            {(post.user_id?.name?.charAt(0) || '?').toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-medium truncate">
                                                            {post.user_id?.name || 'Utilisateur anonyme'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(post.created_at).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <UpvoteButton
                                                    postId={post._id}
                                                    initialUpvotes={post.votes.upvotes}
                                                    hasUserVoted={post.hasUserVoted}
                                                    onVoteChange={(upvotes, hasUserVoted) =>
                                                        handleVoteChange(post._id, upvotes, hasUserVoted)
                                                    }
                                                />
                                            </div>

                                            <div className="mb-3 flex items-center justify-between">
                                                <PostTypeBadge type={post.postType} />
                                                {post.expectedFps && (
                                                    <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                        {FPS_TRANSLATIONS[post.expectedFps] || post.expectedFps}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col">
                                                <div className="mb-3 flex-1">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        {truncateText(post.content)}
                                                    </p>
                                                </div>

                                                {/* Affichage des paramètres graphiques */}
                                                {post.settings && Object.keys(post.settings).length > 0 && (
                                                    <div className="space-y-1 text-xs mb-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                                                        <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Paramètres graphiques:
                                                        </div>
                                                        {Object.entries(post.settings)
                                                            .slice(0, 4)
                                                            .map(([key, value]) => (
                                                                <div key={key} className="flex justify-between items-center">
                                                                    <span className="text-gray-600 dark:text-gray-400">
                                                                        {translateSettingName(key)}:
                                                                    </span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                                        {translateSettingValue(String(value))}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        {Object.keys(post.settings).length > 4 && (
                                                            <div className="text-center text-gray-500 italic">
                                                                +{Object.keys(post.settings).length - 4} autres...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center pt-4">
                            <Link href={gameId ? `/games/${gameId}#posts` : '#'}>
                                <Button variant="link" size="sm" disabled={!gameId}>
                                    Voir tous les posts ({posts.length})
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};