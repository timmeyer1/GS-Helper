'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuLogout, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const UserButton = () => {
    const router = useRouter();
    const { data: session, status, update } = useSession();

    // Différents états de skeleton selon le device
    const LoadingSkeleton = () => (
        <div className="flex items-center gap-2">
            <div className="hidden sm:block">
                <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );

    // Affichage pendant le chargement
    if (status === "loading") {
        return <LoadingSkeleton />;
    }

    // Affichage pour utilisateur non connecté
    if (!session) {
        return (
            <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="px-2 h-8 sm:h-9 sm:px-3">
                    <Link href="/login">Connexion</Link>
                </Button>
                <Button variant="default" size="sm" className="px-2 h-8 sm:h-9 sm:px-3">
                    <Link href="/register">Inscription</Link>
                </Button>
            </div>
        );
    }

    const avatarFallback = session.user?.name
        ? session.user.name.charAt(0).toUpperCase()
        : "?";

    const handleSignOut = async () => {
        try {
            // Faire expirer la session côté client immédiatement
            await update({ expires: new Date(0).toISOString() });
            // Puis déconnecter côté serveur
            await signOut({ redirect: false });
            router.push("/");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pl-2 pr-1 sm:pl-3 sm:pr-2 h-auto cursor-pointer"
                >
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline-block max-w-[100px] truncate">
                        {session.user?.name}
                    </span>
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 transition-opacity hover:opacity-90">
                        <AvatarImage
                            src={session.user?.image || undefined}
                            alt={`Avatar de ${session.user?.name || 'utilisateur'}`}
                        />
                        <AvatarFallback className="bg-sky-700 text-white text-xs sm:text-sm">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 p-2" align="end">
                <DropdownMenuLabel className="flex flex-col space-y-1 p-2 mb-1">
                    <p className="font-medium">{session.user?.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{session.user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <Link href="/profile" className="block">
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 py-1.5">
                            <User className="h-4 w-4" />
                            <span>Mon profil</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/settings" className="block">
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 py-1.5">
                            <Settings className="h-4 w-4" />
                            <span>Paramètres</span>
                        </DropdownMenuItem>
                    </Link>
                    {session.user?.isAdmin && (
                        <Link href="/admin" className="block">
                            <DropdownMenuItem className="cursor-pointer flex items-center gap-2 py-1.5">
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Tableau de bord</span>
                            </DropdownMenuItem>
                        </Link>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLogout
                    className="cursor-pointer flex items-center gap-2 py-1.5"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">
                        Déconnexion
                    </span>
                </DropdownMenuLogout>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;