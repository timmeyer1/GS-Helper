import { fetchFromIGDB } from '@/lib/igdb';
import { GameDetail } from '@/components/gamedetail/GameDetail';
import { notFound } from 'next/navigation';

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

export async function generateStaticParams() {
    try {
        const games = await fetchFromIGDB<Game[]>('games', 'fields id; limit 50; sort popularity desc;');
        return games.map(game => ({ id: game.id.toString() }));
    } catch {
        return [];
    }
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const games = await fetchFromIGDB<Game[]>('games', `
            fields name, summary, cover.image_id, screenshots.image_id, 
            genres.name, platforms.name, release_dates.human, rating;
            where id = ${id};
        `);

        if (!games.length) notFound();
        return <GameDetail game={games[0]} />;
    } catch {
        notFound();
    }
}