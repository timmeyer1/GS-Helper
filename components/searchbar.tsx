"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';
import { Game } from '@/types/game';

interface SearchBarProps {
    query: string;
    setQuery: (value: string) => void;
    onSearch: (e: React.FormEvent) => void;
    suggestions: Game[];
    selectSuggestion: (game: Game) => void;
    isTyping: boolean;
    isLoading: boolean;
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    /** "full" = page /search avec bouton, "compact" = header du site */
    variant?: 'full' | 'compact';
}

export const SearchBar = ({
    query,
    setQuery,
    onSearch,
    suggestions,
    selectSuggestion,
    isTyping,
    isLoading,
    showSuggestions,
    setShowSuggestions,
    variant = 'full',
}: SearchBarProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Ferme les suggestions au clic en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowSuggestions]);

    const isCompact = variant === 'compact';

    return (
        <form onSubmit={onSearch} className={isCompact ? 'mb-4 relative' : 'mb-8 relative'}>
            <div className="flex flex-col sm:flex-row gap-4">
                <div ref={containerRef} className="relative flex-grow">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Entrez le nom d'un jeu..."
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />

                    {suggestions.length > 0 && showSuggestions && (
                        <div className={
                            isCompact
                                ? 'relative z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto'
                                : 'absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto'
                        }>
                            {suggestions.map((game) => (
                                <div
                                    key={game.id}
                                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => { selectSuggestion(game); setShowSuggestions(false); }}
                                >
                                    <div className="w-10 h-14 relative shrink-0 mr-3">
                                        <Image
                                            src={game.cover
                                                ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`
                                                : '/placeholder-game.jpg'}
                                            alt={game.name}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>
                                    <span>{game.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {showSuggestions && (
                        <div className="absolute right-3 top-2.5">
                            {isTyping ? (
                                <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                            ) : (
                                isCompact && query && (
                                    <button
                                        type="button"
                                        onClick={() => { setQuery(''); setShowSuggestions(false); }}
                                        className="text-gray-500 hover:text-gray-800"
                                        aria-label="Effacer la recherche"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>

                {!isCompact && (
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto cursor-pointer"
                        variant="purple"
                        size="lg"
                    >
                        {isLoading ? 'Recherche...' : 'Rechercher'}
                        <Search className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </form>
    );
};