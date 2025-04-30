'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { SearchBar } from '@/components/searchbar';
import GameCard from '@/components/gamecard';
import { Skeleton } from '@/components/ui/skeleton';

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

    const [searchSuggestions, setSearchSuggestions] = useState<Game[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    const [hasSearched, setHasSearched] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Faire une recherche des jeux en fonction du nom
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        // Masquer les suggestions et arrêter le chargement
        setShowSuggestions(false);
        setSearchSuggestions([]);
        setIsTyping(false);
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        setIsLoading(true);
        setHasSearched(true);

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
                        fields name, cover.image_id, parent_game, version_parent, category, platforms;
                        where parent_game = null & version_parent = null & category != 3 & platforms = (6);
                        limit 30;
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


    // Fonction pour gérer le changement de la query (quand on écrit c'est pour éviter que les requêtes bougent bcp trop d'un coup)
    const handleQueryChange = (value: string) => {
        setQuery(value);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        if (!value.trim()) {
            setSearchSuggestions([]);
            setIsTyping(false);
            setShowSuggestions(false);
            return;
        }

        setIsTyping(true);
        setShowSuggestions(true);

        const timeout = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);

        setTypingTimeout(timeout);
    };


    // Fonction pour sélectionner une suggestion
    const selectSuggestion = (game: Game) => {
        setQuery(game.name);
        setSearchSuggestions([]);
        router.push(`/games/${game.id}`);
    };

    const fetchSuggestions = async (searchTerm: string) => {
        if (searchTerm.length < 2) return; // Ne pas rechercher pour les termes trop courts

        try {
            const response = await fetch('/api/igdb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: 'games',
                    query: `
                        search "${searchTerm}";
                        fields name, cover.image_id, parent_game, version_parent, category;
                        where parent_game = null & version_parent = null & category != 3;
                        limit 5;
                    `
                }),
            });

            const data = await response.json();
            setSearchSuggestions(data);
            setIsTyping(false);
        } catch (error) {
            console.error('Erreur lors de la recherche de suggestions:', error);
            setIsTyping(false);
        }
    };



    // Search new games (new releases)
    const fetchNewGames = async () => {
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            const sixMonthsAgo = currentTime - 60 * 60 * 24 * 180; // 6 mois en arrière

            const response = await fetch('/api/igdb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: 'games',
                    query: `
                        fields name, cover.image_id, first_release_date, rating, total_rating, hypes;
                        where first_release_date > ${sixMonthsAgo}
                        & first_release_date < ${currentTime}
                        & cover != null 
                        & hypes >= 33
                        & platforms = (6);
                        sort first_release_date desc;
                        limit 30;
                    `
                }),
            });

            const data = await response.json();
            setNewGames(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des nouveaux jeux populaires:', error);
        }
    };
    useEffect(() => {
        fetchNewGames();
    }, []);







    return (
        <div className="min-h-screen p-3 sm:p-5 md:p-8 lg:p-12">
            <div className="container mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">Rechercher un jeu</h1>

                <SearchBar
                    query={query}
                    setQuery={handleQueryChange}
                    onSearch={handleSearch}
                    suggestions={searchSuggestions}
                    selectSuggestion={selectSuggestion}
                    isTyping={isTyping}
                    isLoading={isLoading}
                    showSuggestions={showSuggestions}
                    setShowSuggestions={setShowSuggestions}
                />

                {results.length > 0 ? (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Résultats ({results.length})</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {results.map(game => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </div>
                    </div>
                ) : (
                    hasSearched && results.length === 0 && !isLoading && (
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
                                <GameCard key={game.id} game={game} />
                            ))
                        ) : (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton
                                        className="bg-gray-200 rounded-lg"
                                        style={{ height: 256 }}
                                    />
                                    <Skeleton className="h-4 w-[90%]" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
}