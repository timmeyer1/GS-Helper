// app/search/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

type Game = {
    id: number;
    name: string;
    cover?: { id: number; image_id: string };
};

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [newGames, setNewGames] = useState<Game[]>([]);

    // Faire une recherche des jeux en fonction du nom
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/igdb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: 'games',
                    query: `
            search "${query}";
            fields name, cover.image_id, parent_game, version_parent, category;
            where parent_game = null & version_parent = null & category != 3;
            limit 20;
          `
                }),
            });

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Search new games (new releases)
    const fetchNewGames = async () => {
        try {
            const response = await fetch('/api/igdb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: 'games',
                    query: `
                        search *;
                        fields name, cover.image_id;
                        limit 30;
                    `
                }),
            });

            const data = await response.json();
            setNewGames(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des nouveaux jeux:', error);
        }
    };
    useEffect(() => {
        fetchNewGames();
    }, []);




    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-10 lg:p-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">Rechercher un jeu</h1>

            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Entrez le nom d'un jeu..."
                        className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto cursor-pointer" variant={"purple"} size={"lg"}>
                        {isLoading ? 'Recherche...' : 'Rechercher'}
                        <Search className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </form>

            {results.length > 0 ? (
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">Résultats ({results.length})</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map(game => (
                            <Link
                                href={`/games/${game.id}`}
                                key={game.id}
                                className="group"
                            >
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                                    <Image
                                        src={game.cover
                                            ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
                                            : '/placeholder-game.jpg'
                                        }
                                        alt={game.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <h2 className="mt-2 text-sm sm:text-base font-medium group-hover:text-blue-600 line-clamp-2">{game.name}</h2>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                query && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Aucun résultat trouvé pour "{query}"</p>
                    </div>
                )
            )}

            {/* Affichage des nouveaux jeux */}
            <div className="mt-16">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Nouveautés</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {newGames.length > 0 ? (
                        newGames.map(game => (
                            <Link
                                href={`/games/${game.id}`}
                                key={game.id}
                                className="group"
                            >
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                                    <Image
                                        src={game.cover
                                            ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
                                            : '/placeholder-game.jpg'
                                        }
                                        alt={game.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <h2 className="mt-2 text-sm sm:text-base font-medium group-hover:text-blue-600 line-clamp-2">{game.name}</h2>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-gray-500">Aucune nouveauté disponible pour l'instant.</div>
                    )}
                </div>
            </div>
        </div>

    );
}