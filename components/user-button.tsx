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

    if (status === "loading") {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex space-x-4">
                <Button variant="ghost">
                    <Link href="/login">Connexion</Link>
                </Button>
                <Button variant="default">
                    <Link href="/register">Inscription</Link>
                </Button>
            </div>
        );
    }

    const avatarFallback = session.user?.name
        ? session.user.name.charAt(0).toUpperCase()
        : "?";

    const handleSignOut = async () => {
        // Faire expirer la session côté client immédiatement
        await update({ expires: new Date(0).toISOString() });
        // Puis déconnecter côté serveur
        await signOut({ redirect: false });
        router.push("/");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pl-2 cursor-pointer">
                    <span className="text-sm font-medium hidden sm:inline-block">
                        {session.user?.name}
                    </span>
                    <Avatar className="h-8 w-8 transition-opacity hover:opacity-90">
                        <AvatarImage
                            src={session.user?.image || undefined}
                            alt={`Avatar de ${session.user?.name || 'utilisateur'}`}
                        />
                        <AvatarFallback className="bg-sky-700 text-white">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 p-2 mx-4">
                <DropdownMenuLabel className="flex flex-col space-y-1 p-2 mb-2">
                    <p className="font-medium">{session.user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <Link href="/profile" className="flex items-center gap-2">
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 w-full">
                            <User className="h-4 w-4" />
                            <span>Mon profil</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2">
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 w-full">
                            <Settings className="h-4 w-4" />
                            <span>Paramètres</span>
                        </DropdownMenuItem>
                    </Link>
                    {session.user?.isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2">
                            <DropdownMenuItem className="cursor-pointer flex items-center gap-2 w-full">
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Tableau de bord</span>
                            </DropdownMenuItem>
                        </Link>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLogout className="cursor-pointer flex items-center gap-2" onClick={handleSignOut}>
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