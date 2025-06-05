import { PostDetail } from '@/components/posts/PostDetail';
import { Metadata } from 'next';

interface PostDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Fonction pour générer les métadonnées dynamiques
export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
    const { id } = await params;

    try {
        return {
            title: `Post #${id} - GameConfig`,
            description: 'Découvrez cette configuration de jeu partagée par la communauté',
            openGraph: {
                title: `Configuration de jeu - GameConfig`,
                description: 'Découvrez cette configuration de jeu partagée par la communauté',
                type: 'article',
            },
        };
    } catch (error) {
        return {
            title: 'Post non trouvé - GameConfig',
            description: 'Ce post n\'existe pas ou a été supprimé',
        };
    }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8">
            <PostDetail postId={id} />
        </div>
    );
}