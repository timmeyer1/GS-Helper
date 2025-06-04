"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Trophy,
    Target,
    CircleEqual,
    Monitor,
    Cpu,
    HardDrive,
    Calendar,
    User,
    Settings,
    Gamepad2
} from 'lucide-react';
import { UpvoteButton } from '../gamedetail/posts/UpvoteButton';
import Link from 'next/link';

interface HardwareItem {
    _id: string;
    libelle: string;
    type?: string;
    brand?: string;
}

interface GameMetadata {
    name: string;
    cover_url?: string;
}

interface PostConfig {
    gpu_id?: HardwareItem;
    cpu_id?: HardwareItem;
    ram_id?: HardwareItem;
    screenresolution_id?: HardwareItem;
}

interface PostDetail {
    _id: string;
    user_id: {
        _id: string;
        name?: string;
        email?: string;
        image?: string;
    };
    game_id: number;
    game_metadata: GameMetadata;
    config: PostConfig;
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

const POST_TYPE_CONFIG = {
    equilibre: {
        icon: CircleEqual,
        label: 'Équilibré',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        description: 'Configuration offrant un bon compromis entre qualité visuelle et performance'
    },
    performance: {
        icon: Trophy,
        label: 'Performance',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        description: 'Configuration optimisée pour maximiser les FPS'
    },
    qualite: {
        icon: Target,
        label: 'Qualité',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        description: 'Configuration privilégiant la qualité visuelle'
    }
};

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

const SETTINGS_VALUES_TRANSLATIONS: Record<string, string> = {
    Low: 'Faible',
    Medium: 'Moyen',
    High: 'Élevé',
    Ultra: 'Ultra'
};

const FPS_TRANSLATIONS: Record<string, string> = {
    '-60': 'Moins de 60 FPS',
    '60-80': '60-80 FPS',
    '80-100': '80-100 FPS',
    '100-120': '100-120 FPS',
    '+120': 'Plus de 120 FPS'
};

// Interface pour les props du CustomTag
interface CustomTagProps {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'secondary';
    className?: string;
}

const CustomTag: React.FC<CustomTagProps> = ({ children, variant = 'default', className = '' }) => {
    const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';

    const variants: Record<'default' | 'outline' | 'secondary', string> = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        outline: 'border border-gray-300 text-gray-700 bg-white dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800',
        secondary: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const PostDetailSkeleton = () => (
    <div className="max-w-4xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-20" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Skeleton className="h-6 w-20 mb-3" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Skeleton className="h-6 w-32 mb-3" />
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-6 w-32 mb-3" />
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-8 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

export const PostDetail: React.FC<{ postId: string }> = ({ postId }) => {
    const router = useRouter();
    const [post, setPost] = useState<PostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/posts/${postId}`);

                if (!response.ok) {
                    throw new Error('Post non trouvé');
                }

                const data = await response.json();
                setPost(data.post);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const handleVoteChange = (postId: string, newUpvotes: number, hasUserVoted: boolean) => {
        if (post) {
            setPost({
                ...post,
                votes: { ...post.votes, upvotes: newUpvotes },
                hasUserVoted
            });
        }
    };

    const translateSettingName = (settingName: string): string => {
        return SETTINGS_TRANSLATIONS[settingName] || settingName.replace('_', ' ');
    };

    const translateSettingValue = (value: string): string => {
        return SETTINGS_VALUES_TRANSLATIONS[value] || value;
    };

    if (loading) {
        return <PostDetailSkeleton />;
    }

    if (error || !post) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">😕</div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Post non trouvé
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {error || 'Ce post n\'existe pas ou a été supprimé.'}
                            </p>
                            <Button onClick={() => router.back()} className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const postTypeConfig = POST_TYPE_CONFIG[post.postType];
    const PostTypeIcon = postTypeConfig.icon;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header avec navigation */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </Button>

                {post.game_metadata && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Gamepad2 className="w-4 h-4" />
                        <Link
                            href={`/games/${post.game_id}`}
                            className="hover:text-gray-900 dark:hover:text-gray-200 hover:underline"
                        >
                            {post.game_metadata.name}
                        </Link>
                    </div>
                )}
            </div>

            {/* Post principal */}
            <Card>
                <CardHeader>
                    {/* Auteur et date */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src={post.user_id?.image}
                                    alt={`Avatar de ${post.user_id?.name || 'utilisateur'}`}
                                />
                                <AvatarFallback className="bg-sky-700 text-white">
                                    {(post.user_id?.name?.charAt(0) || '?').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold text-lg">
                                    {post.user_id?.name || 'Utilisateur anonyme'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(post.created_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
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

                    {/* Type de post et FPS */}
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex items-center gap-2">
                            <CustomTag className={postTypeConfig.color}>
                                <PostTypeIcon className="w-4 h-4 mr-1" />
                                {postTypeConfig.label}
                            </CustomTag>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {postTypeConfig.description}
                            </span>
                        </div>

                        {post.expectedFps && (
                            <CustomTag variant="outline">
                                {FPS_TRANSLATIONS[post.expectedFps] || post.expectedFps}
                            </CustomTag>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Contenu du post */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Description
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Paramètres graphiques */}
                        {post.settings && Object.keys(post.settings).length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Paramètres graphiques
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                                    {Object.entries(post.settings).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {translateSettingName(key)}
                                            </span>
                                            <CustomTag variant="secondary">
                                                {translateSettingValue(String(value))}
                                            </CustomTag>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Configuration matérielle */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Monitor className="w-5 h-5" />
                                Configuration matérielle
                            </h3>
                            <div className="space-y-3">
                                {post.config.gpu_id && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                            <Monitor className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">GPU</div>
                                            <div className="font-medium">{post.config.gpu_id.libelle}</div>
                                        </div>
                                    </div>
                                )}

                                {post.config.cpu_id && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">CPU</div>
                                            <div className="font-medium">{post.config.cpu_id.libelle}</div>
                                        </div>
                                    </div>
                                )}

                                {post.config.ram_id && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                            <HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">RAM</div>
                                            <div className="font-medium">{post.config.ram_id.libelle}</div>
                                        </div>
                                    </div>
                                )}

                                {post.config.screenresolution_id && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                            <Monitor className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Résolution</div>
                                            <div className="font-medium">{post.config.screenresolution_id.libelle}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};