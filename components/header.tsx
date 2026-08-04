"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MonitorSmartphone, Settings2, Gamepad2, Plus, Search, X } from 'lucide-react';
import UserButton from './user-button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Separator } from './ui/separator';
import { SearchBar } from './searchbar';
import { useGameSearch } from '@/lib/hooks/useGameSearch';
import { Game } from '@/types/game';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [logoState, setLogoState] = useState<'default' | 'hover' | 'pressed'>('default');
    const router = useRouter();

    // Fetch games
    useEffect(() => {
        async function fetchGames() {
            const currentTime = Math.floor(Date.now() / 1000);
            const sixMonthsAgo = currentTime - 60 * 60 * 24 * 180; // 6 mois en arrière
            try {
                const response = await fetch('/api/igdb', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpoint: 'games',
                        query: `fields name, cover.image_id, cover.id, first_release_date, rating, total_rating, hypes;
                        where first_release_date > ${sixMonthsAgo}
                        & first_release_date < ${currentTime}
                        & cover != null 
                        & hypes >= 33
                        & platforms = (6);
                        sort first_release_date desc;
                        limit 7;`
                    }),
                });
                const data = await response.json();
                setGames(data);
            } catch (error) {
                console.error('Erreur de récupération des jeux:', error);
            } finally {
                setIsLoadingGames(false);
            }
        }

        fetchGames();
    }, []);

    // ---------------------------------------------------------------- BARRE DE RECHERCHE ----------------------------------------------------------------
    // La recherche du header n'affiche pas de résultats elle-même : elle redirige vers /search,
    // qui possède déjà toute la logique d'affichage (résultats + nouveautés).
    const goToSearchResults = useCallback((term: string) => {
        setShowMobileSearch(false);
        router.push(`/search?q=${encodeURIComponent(term)}`);
    }, [router]);

    const {
        query,
        setQuery,
        suggestions,
        isTyping,
        showSuggestions,
        setShowSuggestions,
        handleSearch,
        selectSuggestion: selectSuggestionFromHook,
    } = useGameSearch({ onSearchSubmit: goToSearchResults });

    // Ferme la popup mobile après sélection d'une suggestion, en plus de la navigation gérée par le hook
    const selectSuggestion = useCallback((game: Game) => {
        setShowMobileSearch(false);
        selectSuggestionFromHook(game);
    }, [selectSuggestionFromHook]);

    // Composant pour les jaquettes de jeux en chargement
    const GameCoverSkeletons = () => (
        <>
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] w-full">
                    <Skeleton className="h-full w-full rounded-lg" />
                </div>
            ))}
        </>
    );

    // Fonction pour obtenir le bon logo selon l'état
    const getLogoSrc = () => {
        switch (logoState) {
            case 'hover':
                return '/logo/logo_hover.png';
            case 'pressed':
                return '/logo/logo_press.png';
            default:
                return '/logo/logo.png';
        }
    };

    return (
        <>
            <header className="flex justify-between items-center p-2 sm:p-4 border-b bg-white shadow-sm">
                {/* Logo */}
                <Link
                    href="/"
                    className="block"
                    onMouseEnter={() => setLogoState('hover')}
                    onMouseLeave={() => setLogoState('default')}
                    onMouseDown={() => setLogoState('pressed')}
                    onMouseUp={() => setLogoState('hover')}
                >
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-200 hover:scale-105 active:scale-95">
                        <Image
                            src={getLogoSrc()}
                            alt="GS Helper Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex md:items-center md:space-x-4">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {/* Jeux */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="cursor-pointer">
                                    <Gamepad2 className="h-4 w-4 mr-2" />
                                    Jeux
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="w-[600px] left-0">
                                        <span className="px-4 py-2 text-gray-500 text-sm font-bold">Jeux populaires :</span>
                                        <li className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 p-2 px-4">
                                            {isLoadingGames ? (
                                                <GameCoverSkeletons />
                                            ) : (
                                                games.map((game) => (
                                                    <Link key={game.id} href={`/games/${game.id}`} className="group aspect-[3/4]">
                                                        <ul>
                                                            {game.cover ? (
                                                                <img
                                                                    src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
                                                                    alt={game.name}
                                                                    className="w-full h-full object-cover rounded-lg mb-2 group-hover:scale-105 group-hover:shadow-xl transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <Skeleton className="h-full w-full rounded-lg" />
                                                            )}
                                                        </ul>
                                                    </Link>
                                                ))
                                            )}
                                        </li>
                                    </ul>
                                    <div className="px-4 pb-3 text-gray-500 text-sm flex items-center">
                                        <Link href="/search" className="flex items-center hover:bg-gray-100 hover:text-gray-700 p-1">
                                            <Plus className="h-4 w-4 mr-1" />
                                            <span>Voir plus</span>
                                        </Link>
                                    </div>

                                    <Separator className="mb-4" />
                                    <SearchBar
                                        variant="compact"
                                        query={query}
                                        setQuery={setQuery}
                                        onSearch={handleSearch}
                                        suggestions={suggestions}
                                        selectSuggestion={selectSuggestion}
                                        isTyping={isTyping}
                                        isLoading={false}
                                        showSuggestions={showSuggestions}
                                        setShowSuggestions={setShowSuggestions}
                                    />
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            {/* Scanneur */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="cursor-pointer">
                                    <Settings2 className="h-4 w-4 mr-2" />
                                    Scanneur
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="w-64">
                                        <Button variant="ghost" className="w-full justify-start cursor-pointer">
                                            <MonitorSmartphone className="mr-2 h-5 w-5" /> Détection automatique
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start cursor-pointer">
                                            <Settings2 className="mr-2 h-5 w-5" /> Choisir manuellement
                                        </Button>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex space-x-4">
                        <UserButton />
                    </div>
                </nav>

                {/* Mobile Actions - Search Button + User Button */}
                <div className="flex items-center space-x-2 md:hidden">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileSearch(true)}
                        className="p-2"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <UserButton />
                </div>
            </header>

            {/* Mobile Search Popup */}
            {showMobileSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
                    <div className="bg-white w-full min-h-screen">
                        {/* Popup Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Rechercher un jeu</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMobileSearch(false)}
                                className="p-2"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Search Content */}
                        <div className="p-4">
                            <SearchBar
                                variant="compact"
                                query={query}
                                setQuery={setQuery}
                                onSearch={handleSearch}
                                suggestions={suggestions}
                                selectSuggestion={selectSuggestion}
                                isTyping={isTyping}
                                isLoading={false}
                                showSuggestions={showSuggestions}
                                setShowSuggestions={setShowSuggestions}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}