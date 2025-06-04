'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/searchbar';
import GameCard from '@/components/gamecard';
import { Skeleton } from '@/components/ui/skeleton';

type Game = {
    id: number;
    name: string;
    cover?: { id: number; image_id: string };
};

interface SearchPageClientProps {
    initialNewGames: Game[];
}

export default function SearchPageClient({ initialNewGames }: SearchPageClientProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // États pour la gestion des suggestions de recherche
    const [searchSuggestions, setSearchSuggestions] = useState<Game[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const router = useRouter();

    // Recherche principale des jeux
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        // Masquer les suggestions et nettoyer l'état
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
                        fields name, cover.image_id, parent_game, version_parent, category, platforms;
                        where parent_game = null & version_parent = null & category != 3 & platforms = (6, 167, 48) & name ~ *"${query}"*;
                        sort rating desc;
                        limit 30;
                    `
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la recherche');
            }

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Gestion du changement de la requête de recherche avec debouncing
    const handleQueryChange = (value: string) => {
        setQuery(value);

        // Nettoyer le timeout précédent
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Si le champ est vide, masquer les suggestions
        if (!value.trim()) {
            setSearchSuggestions([]);
            setIsTyping(false);
            setShowSuggestions(false);
            return;
        }

        setIsTyping(true);
        setShowSuggestions(true);

        // Débouncer les appels API pour éviter trop de requêtes
        const timeout = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);

        setTypingTimeout(timeout);
    };

    // Récupération des suggestions de recherche
    const fetchSuggestions = async (searchTerm: string) => {
        if (searchTerm.length < 2) return;

        try {
            const response = await fetch('/api/igdb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: 'games',
                    query: `
                        fields name, cover.image_id, parent_game, version_parent, category, platforms;
                        where parent_game = null & version_parent = null & category != 3 & platforms = (6, 167, 48) & name ~ *"${searchTerm}"*;
                        sort rating desc;
                        limit 5;
                    `
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des suggestions');
            }

            const data = await response.json();
            setSearchSuggestions(data);
        } catch (error) {
            console.error('Erreur lors de la recherche de suggestions:', error);
            setSearchSuggestions([]);
        } finally {
            setIsTyping(false);
        }
    };

    // Sélection d'une suggestion
    const selectSuggestion = (game: Game) => {
        setQuery(game.name);
        setSearchSuggestions([]);
        setShowSuggestions(false);
        router.push(`/games/${game.id}`);
    };

    // Composant pour afficher les squelettes de chargement
    const GameSkeleton = () => (
        <div className="space-y-2">
            <Skeleton
                className="bg-gray-200 rounded-lg"
                style={{ height: 256 }}
            />
            <Skeleton className="h-4 w-[90%]" />
        </div>
    );

    return (
        <div className="min-h-screen p-3 sm:p-5 md:p-8 lg:p-12">
            <div className="container mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
                    Rechercher un jeu
                </h1>

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

                {/* Résultats de recherche */}
                {results.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                            Résultats ({results.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {results.map(game => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Message quand aucun résultat n'est trouvé */}
                {hasSearched && results.length === 0 && !isLoading && (
                    <div className="text-center py-8 mb-16">
                        <p className="text-gray-500">
                            Aucun résultat trouvé pour "{query}"
                        </p>
                    </div>
                )}

                {/* Section des nouveautés */}
                <div className="mt-16">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                        Nouveautés
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {initialNewGames.length > 0 ? (
                            initialNewGames.map(game => (
                                <GameCard key={game.id} game={game} />
                            ))
                        ) : (
                            // Affichage des squelettes pendant le chargement
                            [...Array(10)].map((_, i) => (
                                <GameSkeleton key={i} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}