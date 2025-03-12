// app/games/[id]/page.tsx
import { fetchFromIGDB } from '@/lib/igdb';
import { GameDetail } from '@/components/gamedetail';
import { notFound } from 'next/navigation';

// Définition du type pour les jeux
type Game = {
    id: number;
    name: string;
    summary?: string;
    cover?: { id: number; image_id: string };
    screenshots?: Array<{ id: number; image_id: string }>;
    genres?: Array<{ id: number; name: string }>;
    platforms?: Array<{ id: number; name: string }>;
    release_dates?: Array<{ id: number; date: number; human: string }>;
    rating?: number;
};

// Cette fonction génère les paramètres pour les routes statiques
export async function generateStaticParams() {
    try {
        // Récupérer les jeux populaires pour pré-rendre leurs pages
        const games = await fetchFromIGDB<Game[]>('games', 'fields id; limit 50; sort popularity desc;');

        return games.map((game: Game) => ({
            id: game.id.toString(),
        }));
    } catch (error) {
        console.error('Erreur dans generateStaticParams:', error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

async function getGame(id: string): Promise<Game | null> {
    try {
        const query = `
      fields name, summary, cover.image_id, screenshots.image_id, 
      genres.name, platforms.name, release_dates.human, rating;
      where id = ${id};
    `;

        const games = await fetchFromIGDB<Game[]>('games', query);
        return games.length > 0 ? games[0] : null;
    } catch (error) {
        console.error('Erreur lors de la récupération du jeu:', error);
        return null;
    }
}

export default async function GamePage({ params }: { params: { id: string } }) {
    const game = await getGame(params.id);

    if (!game) {
        notFound();
    }

    return <GameDetail game={game} />;
}