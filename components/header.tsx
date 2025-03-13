'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, MonitorSmartphone, Settings2, Gamepad2, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { slugify } from '@/utils/slugify';

type Game = {
    id: number,
    name: string,
    cover?: { image_id: string }
};

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Gestionnaire pour fermer le drawer en cliquant en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (mobileMenuOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        }

        // Désactiver le défilement du body quand le drawer est ouvert
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Gestionnaire pour les touches d'accessibilité
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        async function fetchGames() {
            try {
                const response = await fetch('/api/igdb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: 'games',
                        query: `
                            where id = (1877, 119133, 1020, 1942, 25076, 215060, 136625);
                            fields name, cover.image_id;
                        `,
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

    function DropdownMenu({
        label,
        children,
        width = "w-80"
    }: {
        label: string;
        children: React.ReactNode;
        width?: string;
    }) {
        const [open, setOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);
        const [alignRight, setAlignRight] = useState(false);

        // Gérer l'ouverture/fermeture et la position en un seul useEffect
        useEffect(() => {
            if (open && dropdownRef.current) {
                // Vérifier si le menu dépasse à droite
                const rect = dropdownRef.current.getBoundingClientRect();
                const menuWidth = parseInt(width.replace(/[^\d]/g, '') || '320');
                const viewportWidth = window.innerWidth;
                setAlignRight(rect.left + menuWidth > viewportWidth);
            }

            // Nettoyage du timeout
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }, [open, width]);

        const handleMouseEnter = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            setOpen(true);
        };

        const handleMouseLeave = () => {
            timeoutRef.current = setTimeout(() => setOpen(false), 20);
        };

        const handleClick = () => {
            setOpen(!open);
        };

        // Créer les styles de positionnement une seule fois
        const positionStyle = alignRight ? { right: 0 } : { left: 0 };

        // Pour le mobile, le dropdown sera un accordion
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        return (
            <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={isMobile ? undefined : handleMouseEnter}
                onMouseLeave={isMobile ? undefined : handleMouseLeave}
            >
                <Button
                    variant="ghost"
                    className="flex items-center cursor-pointer"
                    onClick={isMobile ? handleClick : undefined}
                    aria-expanded={open}
                    aria-haspopup="true"
                >
                    {label} <ChevronDown className="ml-1 h-4 w-4 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </Button>
                {open && (
                    <>
                        <div
                            className={`${isMobile ? 'relative w-full mt-2' : `absolute mt-2 ${width}`} bg-white border rounded-lg shadow-lg p-4 z-50`}
                            style={isMobile ? {} : positionStyle}
                            onMouseEnter={isMobile ? undefined : handleMouseEnter}
                            onMouseLeave={isMobile ? undefined : handleMouseLeave}
                            role="menu"
                            aria-labelledby={`dropdown-${label}`}
                        >
                            {children}
                        </div>
                        {/* Zone tampon invisible simplifiée (seulement pour desktop) */}
                        {!isMobile && (
                            <div
                                className={`absolute ${width} h-2 mt-0 z-40`}
                                style={positionStyle}
                                onMouseEnter={handleMouseEnter}
                            />
                        )}
                    </>
                )}
            </div>
        );
    }

    function GameCard({ title }: { title: string }) {
        return (
            <div className="p-2 bg-gray-100 rounded-lg text-center text-sm font-medium hover:bg-gray-200 cursor-pointer">
                {title}
            </div>
        );
    }

    return (
        <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
            {/* Logo */}
            <Button
                className="cursor-pointer text-xl hover:border-2"
                variant={"ghost"}
            >
                <Link href={"/"}>
                    GS Helper
                </Link>
            </Button>

            {/* Navigation pour desktop */}
            <nav className="hidden md:flex md:items-center md:space-x-6">
                <DropdownMenu label="Jeux" width="w-[600px]">
                    <div className="px-4 py-2 text-gray-500 text-sm">Jeux populaires:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4">
                        {isLoading ? (
                            <div>Chargement...</div>
                        ) : (
                            games.map((game) => (
                                <div key={game.id} className="text-center group">
                                    <Link href={`/games/${slugify(game.name)}`}>
                                        {game.cover ? (
                                            <img
                                                src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
                                                alt={game.name}
                                                className="w-full h-auto rounded-lg mb-2 cursor-pointer group-hover:scale-105 group-hover:shadow-xl transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-24 bg-gray-300 rounded-lg mb-2 cursor-pointer group-hover:scale-105 group-hover:shadow-xl transition-transform duration-300" />
                                        )}
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="border-t p-2">
                        <input
                            type="text"
                            placeholder="Rechercher un jeu..."
                            className="w-full p-2 border rounded-md"
                            aria-label="Rechercher un jeu"
                        />
                    </div>
                </DropdownMenu>


                <DropdownMenu label="Scanneur" width="w-64">
                    <Button variant="ghost" className="w-full justify-start">
                        <MonitorSmartphone className="mr-2 h-5 w-5" /> Détection automatique
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings2 className="mr-2 h-5 w-5" /> Choisir manuellement
                    </Button>
                </DropdownMenu>

                {/* Auth */}
                <div className="flex space-x-4">
                    <Button className="cursor-pointer" variant="ghost">Connexion</Button>
                    <Button className="cursor-pointer" variant="default">Inscription</Button>
                </div>
            </nav>

            {/* Drawer mobile */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu size={24} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                    <div className="flex flex-col p-4 space-y-4">
                        <DropdownMenu label="Jeux" width="w-full">
                            <div className="px-4 py-2 text-gray-500 text-sm">Jeux populaires:</div>
                            <div className="grid grid-cols-2 gap-2 p-2">
                                <GameCard title="Cyberpunk 2077" />
                                <GameCard title="Elden Ring" />
                                <GameCard title="GTA VI" />
                                <GameCard title="The Witcher 3" />
                                <GameCard title="Red Dead Redemption 2" />
                                <GameCard title="Assassin's Creed Mirage" />
                                <GameCard title="Hogwarts Legacy" />
                            </div>
                        </DropdownMenu>
                        <DropdownMenu label="Scanneur" width="w-full">
                            <Button variant="ghost" className="w-full justify-start">
                                <MonitorSmartphone className="mr-2 h-5 w-5" /> Détection automatique
                            </Button>
                            <Button variant="ghost" className="w-full justify-start">
                                <Settings2 className="mr-2 h-5 w-5" /> Choisir manuellement
                            </Button>
                        </DropdownMenu>
                        <input type="text" placeholder="Rechercher un jeu..." className="w-full p-2 border rounded-md" aria-label="Rechercher un jeu" />

                        <div className="flex flex-col space-y-2 pt-4 border-t">
                            <Button className="w-full" variant="ghost">Connexion</Button>
                            <Button className="w-full" variant="default">Inscription</Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

// VERSION QUI MARCHE