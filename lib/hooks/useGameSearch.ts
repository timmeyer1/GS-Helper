'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/game';

const SUGGESTION_DEBOUNCE_MS = 300;
const MIN_SUGGESTION_LENGTH = 2;
const SUGGESTIONS_LIMIT = 5;

interface UseGameSearchOptions {
    /** Appelé avec le terme final quand l'utilisateur valide la recherche (submit). */
    onSearchSubmit: (query: string) => void;
    initialQuery?: string;
}

/**
 * Centralise la logique de recherche de jeux (saisie, suggestions débouncées,
 * soumission, sélection d'une suggestion). Utilisé à la fois par le header
 * (qui redirige vers /search) et par la page /search (qui affiche les résultats),
 * pour éviter la duplication de la logique de fetch/debounce entre les deux.
 *
 * Filtre IGDB : "name ~ *"terme"*" permet de matcher un préfixe ou une sous-chaîne
 * partielle (ex: "cyberp" -> "Cyberpunk 2077"), contrairement au mot-clé "search"
 * qui ne fait que de la pertinence sur des mots complets et interdit le "sort".
 * "category != 3" seul excluait toute ligne où category est null (très fréquent
 * chez IGDB), y compris le jeu principal lui-même : on accepte donc explicitement
 * category = null.
 * On ne filtre plus sur parent_game : IGDB catégorise parfois des remasters/remakes
 * comme "enfants" du jeu original sans renseigner "category", ce qui les excluait à
 * tort avec ce filtre. On garde en revanche version_parent = null, qui lui ne risque
 * pas d'exclure un remaster : il ne sert qu'à distinguer les éditions SKU (Deluxe,
 * Gold, Jackdaw...) du jeu de base, jamais un remaster/remake à part entière.
 * Conséquence acceptée : les petits DLC de contenu narratif (ex: "Freedom Cry",
 * "Aveline") peuvent encore réapparaître, car IGDB les modélise via parent_game
 * exactement comme les remasters, sans champ fiable pour les distinguer.
 */
export function useGameSearch({ onSearchSubmit, initialQuery = '' }: UseGameSearchOptions) {
    const [query, setQueryState] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState<Game[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const fetchSuggestions = useCallback(async (term: string) => {
        if (term.length < MIN_SUGGESTION_LENGTH) {
            setIsTyping(false);
            return;
        }

        try {
            const response = await fetch('/api/igdb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: 'games',
                    query: `
                        fields name, cover.image_id, parent_game, version_parent, category, platforms, total_rating;
                        where version_parent = null & (category = null | category != 3) & platforms = (6, 167, 48) & name ~ *"${term}"*;
                        sort total_rating desc;
                        limit ${SUGGESTIONS_LIMIT};
                    `,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des suggestions');
            }

            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Erreur lors de la recherche de suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsTyping(false);
        }
    }, []);

    const setQuery = useCallback((value: string) => {
        setQueryState(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!value.trim()) {
            setSuggestions([]);
            setIsTyping(false);
            setShowSuggestions(false);
            return;
        }

        setIsTyping(true);
        setShowSuggestions(true);
        debounceRef.current = setTimeout(() => fetchSuggestions(value), SUGGESTION_DEBOUNCE_MS);
    }, [fetchSuggestions]);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = query.trim();
        if (!trimmed) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setShowSuggestions(false);
        setSuggestions([]);
        setIsTyping(false);
        onSearchSubmit(trimmed);
    }, [query, onSearchSubmit]);

    const selectSuggestion = useCallback((game: Game) => {
        setQueryState(game.name);
        setSuggestions([]);
        setShowSuggestions(false);
        router.push(`/games/${game.id}`);
    }, [router]);

    return {
        query,
        setQuery,
        suggestions,
        isTyping,
        showSuggestions,
        setShowSuggestions,
        handleSearch,
        selectSuggestion,
    };
}