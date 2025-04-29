'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MonitorSmartphone, Settings2, Gamepad2 } from 'lucide-react';
import UserButton from './user-button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Separator } from './ui/separator';
import { SearchHeader } from './SearchHeader';
import { Game } from '@/types/game';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<Game[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const [results, setResults] = useState<Game[]>([]);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

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
                setIsLoading(false);
            }
        }

        fetchGames();
    }, []);



    // ---------------------------------------------------------------- BARRE DE RECHERCHE ----------------------------------------------------------------

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
                            fields name, cover.image_id, cover.id, parent_game, version_parent, category, platforms;
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

    // Fonction pour sélectionner une suggestion
    const selectSuggestion = (game: Game) => {
        setQuery(game.name);
        setSearchSuggestions([]);
        router.push(`/games/${game.id}`);
    };

    // Fonction pour ne pas rechercher les termes trop courts
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
                        search "${searchTerm}";
                        fields name, cover.image_id, cover.id, parent_game, version_parent, category;
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

    return (
        <header className="flex justify-between items-center p-4 mx border-b bg-white shadow-sm">
            {/* Logo */}
            <Button className="cursor-pointer text-xl hover:border-2" variant="ghost">
                <Link href="/">
                    GS Helper
                </Link>
            </Button>

            {/* Desktop nav */}
            <nav className="hidden md:flex md:items-center md:space-x-6">
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
                                    <div className="px-4 py-2 text-gray-500 text-sm">Jeux populaires :</div>
                                    <li>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4">
                                            {isLoading
                                                ? Array.from({ length: 7 }).map((_, i) => (
                                                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                                                ))
                                                : games.map((game) => (
                                                    <Link key={game.id} href={`/games/${game.id}`} className="group">
                                                        {game.cover ? (
                                                            <img
                                                                src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
                                                                alt={game.name}
                                                                className="w-full h-full rounded-lg mb-2 group-hover:scale-105 group-hover:shadow-xl transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <Skeleton className="h-24 w-full rounded-lg" />
                                                        )}
                                                    </Link>
                                                ))}
                                        </div>
                                    </li>
                                </ul>
                                <Separator className="mb-4" />
                                <SearchHeader
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
            </nav >
        </header >
    );
}