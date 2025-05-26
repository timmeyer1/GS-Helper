"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';
// Importer le type Game depuis un fichier commun
import { Game } from '@/types/game';

interface SearchHeaderProps {
    query: string;
    setQuery: (value: string) => void;
    onSearch: (e: React.FormEvent) => void;
    suggestions: Game[];
    selectSuggestion: (game: Game) => void;
    isTyping: boolean;
    isLoading: boolean;
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
}

export const SearchHeader = ({
    query,
    setQuery,
    onSearch,
    suggestions,
    selectSuggestion,
    isTyping,
    isLoading,
    showSuggestions,
    setShowSuggestions
}: SearchHeaderProps) => {
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowSuggestions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

    };

    const handleSuggestionClick = (game: Game) => {
        selectSuggestion(game);
        setShowSuggestions(false);
    };

    return (
        <form onSubmit={handleSearch} className="mb-4 relative">
            <div className="flex flex-col sm:flex-row gap-4">
                <div ref={searchContainerRef} className="relative flex-grow">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Entrez le nom d'un jeu..."
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                    </div>

                    {/* Liste des suggestions */}
                    {suggestions.length > 0 && showSuggestions && (
                        <div className="z-9999 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                            {suggestions.map(game => (
                                <div
                                    key={game.id}
                                    className="z-50 flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSuggestionClick(game)}
                                >
                                    <div className="w-10 h-14 relative shrink-0 mr-3">
                                        <Image
                                            src={game.cover
                                                ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`
                                                : '/placeholder-game.jpg'
                                            }
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

                    {/* Indicateur de chargement des suggestions */}
                    {showSuggestions && (
                        <div className="absolute right-3 top-2.5">
                            {isTyping ? (
                                <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                            ) : (
                                query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            setShowSuggestions(false);
                                        }}
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
            </div>
        </form>
    );
};