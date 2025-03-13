import { fetchFromIGDB } from '@/lib/igdb';
import { GameDetail } from '@/components/gamedetail';
import { notFound } from 'next/navigation';

// Définition du type pour les jeux
type Game = {
    id: number;
    name: string;
    slug: string;
    summary?: string;
    cover?: { id: number; image_id: string };
    screenshots?: Array<{ id: number; image_id: string }>;
    genres?: Array<{ id: number; name: string }>;
    platforms?: Array<{ id: number; name: string }>;
    release_dates?: Array<{ id: number; date: number; human: string }>;
    rating?: number;
};

// Générer des slugs pour le rendu statique
export async function generateStaticParams() {
    try {
        const games = await fetchFromIGDB<Game[]>(
            'games',
            'fields id, name, slug; limit 50; sort popularity desc;'
        );

        return games.map((game) => ({
            slug: game.slug,
        }));
    } catch (error) {
        console.error('Erreur dans generateStaticParams:', error);
        return [];
    }
}

async function getGame(slug: string): Promise<Game | null> {
    try {
        const query = `
      fields name, summary, cover.image_id, screenshots.image_id, 
      genres.name, platforms.name, release_dates.human, rating, slug;
      where slug = "${slug}";
    `;

        const games = await fetchFromIGDB<Game[]>('games', query);
        return games.length > 0 ? games[0] : null;
    } catch (error) {
        console.error('Erreur lors de la récupération du jeu:', error);
        return null;
    }
}

export default async function GamePage({ params }: { params: { slug: string } }) {
    const game = await getGame(params.slug);

    if (!game) {
        notFound();
    }

    return <GameDetail game={game} />;
}