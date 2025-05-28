import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UpvoteButton } from './UpvoteButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface PostUser {
    image: undefined;
    _id: string;
    name?: string;
    email?: string;
}

interface PostVotes {
    upvotes: number;
    voters: Array<{
        user_id: string;
    }>;
}

interface Post {
    _id: string;
    user_id: PostUser;
    game_id: number;
    content: string;
    settings: Record<string, string>;
    votes: PostVotes;
    hasUserVoted: boolean;
    created_at: string;
}

interface PostsCardProps {
    gameId?: number;
    userConfig?: UserConfig;
}

export const PostsCard: React.FC<PostsCardProps> = ({ gameId, userConfig }) => {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Récupérer les posts
    useEffect(() => {
        if (!gameId) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/posts?game_id=${gameId}&limit=3&sort=votes`);

                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts || []);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [gameId]);

    const handleVoteChange = (postId: string, newUpvotes: number, hasUserVoted: boolean) => {
        setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        votes: {
                            ...post.votes,
                            upvotes: newUpvotes
                        },
                        hasUserVoted
                    };
                }
                return post;
            });

            // Retrier les posts par upvotes décroissants
            return updatedPosts.sort((a, b) => b.votes.upvotes - a.votes.upvotes);
        });
    };

    const EmptyState = ({ children }: { children: React.ReactNode }) => (
        <div className="flex flex-col justify-center items-center h-48 space-y-4 text-center">
            {children}
        </div>
    );

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Posts populaires</CardTitle>
                    <CardDescription>Chargement des configurations...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Skeleton pour 3 posts */}
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="border rounded-md p-3 bg-slate-50 dark:bg-slate-900 relative">
                                {/* Skeleton pour le badge upvote */}
                                <div className="absolute top-2 right-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>

                                {/* Skeleton pour le nom utilisateur */}
                                <div className="mb-2 pr-20">
                                    <Skeleton className="h-4 w-24" />
                                </div>

                                {/* Skeleton pour les paramètres */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                                    {[...Array(4)].map((_, paramIndex) => (
                                        <div key={paramIndex} className="flex justify-between">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    ))}
                                </div>

                                {/* Skeleton pour le lien détails */}
                                <div className="text-right">
                                    <Skeleton className="h-3 w-20 ml-auto" />
                                </div>
                            </div>
                        ))}

                        {/* Skeleton pour le bouton "Voir tous les posts" */}
                        <div className="text-center pt-2">
                            <Skeleton className="h-6 w-32 mx-auto" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Posts populaires</CardTitle>
                <CardDescription>
                    {userConfig ?
                        'Les configurations les mieux notées' :
                        'Complétez votre profil pour voir des recommandations'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!userConfig ? (
                    <EmptyState>
                        <p className="text-gray-500">Ajoutez votre configuration matérielle pour voir des recommandations</p>
                        <Button variant="outline" onClick={() => router.push('/profile')}>
                            Compléter mon profil
                        </Button>
                    </EmptyState>
                ) : posts.length === 0 ? (
                    <EmptyState>
                        <p className="text-gray-500">Aucun post disponible pour ce jeu</p>
                        <Link href={gameId ? `/games/${gameId}#posts` : '#'}>
                            <Button variant="outline" disabled={!gameId}>
                                Voir tous les posts
                            </Button>
                        </Link>
                    </EmptyState>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => {
                            return (
                                <div key={post._id} className="border rounded-md p-3 bg-slate-50 dark:bg-slate-900 relative">
                                    {/* Bouton upvote en haut à droite */}
                                    <div className="absolute top-2 right-2">
                                        <UpvoteButton
                                            postId={post._id}
                                            initialUpvotes={post.votes.upvotes}
                                            hasUserVoted={post.hasUserVoted}
                                            onVoteChange={(upvotes, hasUserVoted) =>
                                                handleVoteChange(post._id, upvotes, hasUserVoted)
                                            }
                                        />
                                    </div>

                                    {/* Header avec nom utilisateur */}
                                    <div className="flex items-center gap-2 mb-2 pr-20">
                                        <Avatar className="h-6 w-6 sm:h-7 sm:w-7 transition-opacity hover:opacity-90">
                                            <AvatarImage
                                                src={post.user_id?.image || undefined}
                                                alt={`Avatar de ${post.user_id?.name || 'utilisateur'}`}
                                            />
                                            <AvatarFallback className="bg-sky-700 text-white text-xs sm:text-sm">
                                                {(post.user_id?.name?.charAt(0) || '?').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">
                                                {post.user_id?.name || 'Utilisateur anonyme'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(post.created_at).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contenu du post */}
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Paramètres principaux */}
                                    {Object.keys(post.settings).length > 0 && (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                                            {Object.entries(post.settings)
                                                .slice(0, 5)
                                                .map(([key, value]) => (
                                                    <div key={key} className="flex">
                                                        <span className="text-gray-500 capitalize">
                                                            {key.replace('_', ' ')}: &nbsp;
                                                        </span>
                                                        <span className="font-medium">{String(value)}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* Lien vers les détails */}
                                    <div className="text-xs text-right">
                                        <Link
                                            href={gameId ? `/games/${gameId}/posts/${post._id}` : '#'}
                                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                        >
                                            Voir détails
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="text-center pt-2">
                            <Link href={gameId ? `/games/${gameId}#posts` : '#'}>
                                <Button variant="link" size="sm" disabled={!gameId}>
                                    Voir tous les posts
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};