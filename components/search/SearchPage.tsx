'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { SearchBar } from '@/components/searchbar';
import GameCard from '@/components/gamecard';
import { Skeleton } from '@/components/ui/skeleton';
import { useGameSearch } from '@/lib/hooks/useGameSearch';
import { Game } from '@/types/game';

interface SearchPageClientProps {
    initialNewGames: Game[];
    initialQuery?: string;
}

export default function SearchPageClient({ initialNewGames, initialQuery = '' }: SearchPageClientProps) {
    const [results, setResults] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const searchGames = useCallback(async (term: string) => {
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
                        fields name, cover.image_id, parent_game, version_parent, category, platforms, total_rating;
                        where version_parent = null & (category = null | category != 3) & platforms = (6, 167, 48) & name ~ *"${term}"*;
                        sort total_rating desc;
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
    }, []);

    const {
        query,
        setQuery,
        suggestions,
        isTyping,
        showSuggestions,
        setShowSuggestions,
        handleSearch,
        selectSuggestion,
    } = useGameSearch({ onSearchSubmit: searchGames, initialQuery });

    // Déclenche la recherche automatiquement si la page est arrivée avec ?q= (ex: depuis le header)
    useEffect(() => {
        if (initialQuery.trim()) {
            searchGames(initialQuery);
        }
        // Volontairement exécuté une seule fois au montage : seul le ?q= initial doit déclencher cet effet.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-8 lg:p-12">
            <div className="container mx-auto space-y-10">
                <header>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                        Rechercher un jeu
                    </h1>
                </header>

                <SearchBar
                    variant="full"
                    query={query}
                    setQuery={setQuery}
                    onSearch={handleSearch}
                    suggestions={suggestions}
                    selectSuggestion={selectSuggestion}
                    isTyping={isTyping}
                    isLoading={isLoading}
                    showSuggestions={showSuggestions}
                    setShowSuggestions={setShowSuggestions}
                />

                {/* Résultats de recherche */}
                {results.length > 0 && (
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold pb-3 mb-5 border-b border-gray-200">
                            Résultats ({results.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {results.map(game => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Message quand aucun résultat n'est trouvé */}
                {hasSearched && results.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            Aucun résultat trouvé pour "{query}"
                        </p>
                    </div>
                )}

                {/* Section des nouveautés */}
                <section>
                    <h2 className="text-lg sm:text-xl font-semibold pb-3 mb-5 border-b border-gray-200">
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
                </section>
            </div>
        </div>
    );
}