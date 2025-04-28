'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, MonitorSmartphone, Settings2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import UserButton from './user-button';
import { SessionProvider } from 'next-auth/react';

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

    // Fetch games
    useEffect(() => {
        async function fetchGames() {
            try {
                const response = await fetch('/api/igdb', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpoint: 'games',
                        query: `where id = (1877, 119133, 1020, 1942, 25076, 215060, 136625); fields name, cover.image_id;`
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

    // Gestionnaire mobile drawer
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (mobileMenuOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        }
        if (mobileMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Gestion escape
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    function DropdownMenu({ label, children, width = 'w-80' }: { label: string; children: React.ReactNode; width?: string; }) {
        const [open, setOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);
        const [alignRight, setAlignRight] = useState(false);

        useEffect(() => {
            if (open && dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const menuWidth = parseInt(width.replace(/[^\d]/g, '') || '320');
                setAlignRight(rect.left + menuWidth > window.innerWidth);
            }

            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }, [open, width]);

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        return (
            <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={!isMobile ? () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setOpen(true); } : undefined}
                onMouseLeave={!isMobile ? () => { timeoutRef.current = setTimeout(() => setOpen(false), 50); } : undefined}
            >
                <Button
                    variant="ghost"
                    className="flex items-center cursor-pointer"
                    onClick={isMobile ? () => setOpen(!open) : undefined}
                    aria-expanded={open}
                    aria-haspopup="true"
                >
                    {label} <ChevronDown className="ml-1 h-4 w-4 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </Button>
                {open && (
                    <div
                        className={`${isMobile ? 'relative w-full mt-2' : `absolute mt-2 ${width}`} bg-white border rounded-lg shadow-lg p-4 z-50`}
                        style={alignRight && !isMobile ? { right: 0 } : { left: 0 }}
                        role="menu"
                    >
                        {children}
                    </div>
                )}
            </div>
        );
    }

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
                <DropdownMenu label="Jeux" width="w-[600px]">
                    <div className="px-4 py-2 text-gray-500 text-sm">Jeux populaires :</div>
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
                                            className="w-full h-auto rounded-lg mb-2 group-hover:scale-105 group-hover:shadow-xl transition-transform duration-300"
                                        />
                                    ) : (
                                        <Skeleton className="h-24 w-full rounded-lg" />
                                    )}
                                </Link>
                            ))}
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

                <div className="flex space-x-4">
                    <SessionProvider>
                        <UserButton />
                    </SessionProvider>
                </div>
            </nav>

            {/* Mobile drawer */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu size={24} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                    <div className="flex flex-col p-4 space-y-4">
                        <DropdownMenu label="Jeux" width="w-full">
                            <div className="px-4 py-2 text-gray-500 text-sm">Jeux populaires :</div>
                            <div className="grid grid-cols-2 gap-2 p-2">
                                {games.length > 0
                                    ? games.map((game) => (
                                        <Link key={game.id} href={`/games/${game.id}`} className="text-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                                            {game.name}
                                        </Link>
                                    ))
                                    : Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                    ))}
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
