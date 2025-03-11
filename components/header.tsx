'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, MonitorSmartphone, Settings2, Gamepad2 } from 'lucide-react';

export default function Header() {
    return (
        <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
            {/* Logo */}
            <div className="text-xl font-bold">LOGO</div>

            {/* Navigation */}
            <nav className="flex space-x-6 items-center">
                <DropdownMenu label="Jeux" width="w-[600px]">
                    <div className="px-4 py-2 text-gray-500 text-sm">Jeux populaires:</div>
                    <div className="grid grid-cols-7 gap-2 p-2">
                        <GameCard title="Cyberpunk 2077" />
                        <GameCard title="Elden Ring" />
                        <GameCard title="GTA VI" />
                        <GameCard title="The Witcher 3" />
                        <GameCard title="Red Dead Redemption 2" />
                        <GameCard title="Assassin's Creed Mirage" />
                        <GameCard title="Hogwarts Legacy" />
                    </div>
                    <div className="border-t p-2">
                        <input type="text" placeholder="Rechercher un jeu..." className="w-full p-2 border rounded-md" />
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
                <div className="space-x-4">
                    <Button variant="ghost">Connexion</Button>
                    <Button variant="default">Inscription</Button>
                </div>
            </nav>
        </header>
    );
}

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
    const [position, setPosition] = useState({ left: 0, right: 'auto' });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 20);
    };

    // Calculer la position du menu pour éviter le débordement
    useEffect(() => {
        if (open && dropdownRef.current && menuRef.current) {
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            const menuWidth = menuRef.current.offsetWidth;
            const viewportWidth = window.innerWidth;

            // Vérifier si le menu dépasse à droite
            if (dropdownRect.left + menuWidth > viewportWidth) {
                // Positionner à droite du bouton
                setPosition({
                    left: 'auto',
                    right: 0
                });
            } else {
                // Position par défaut à gauche
                setPosition({
                    left: 0,
                    right: 'auto'
                });
            }
        }
    }, [open]);

    // Nettoyer le timeout si le composant est démonté
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button variant="ghost" className="flex items-center">
                {label} <ChevronDown className="ml-1 h-4 w-4 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </Button>

            {open && (
                <div
                    ref={menuRef}
                    className={`absolute mt-2 ${width} bg-white border rounded-lg shadow-lg p-4 z-50`}
                    style={{
                        right: position.right === 'auto' ? position.right : 0
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {children}
                </div>
            )}

            {/* Zone tampon invisible qui s'étend entre le bouton et le menu */}
            {open && (
                <div
                    className={`absolute h-2 mt-0 z-40`}
                    onMouseEnter={handleMouseEnter}
                />
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