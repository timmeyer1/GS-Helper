'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const UserButton = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    // Afficher un loader pendant la vérification de la session
    if (status === "loading") {
        return <Loader className="h-5 w-5 animate-spin" />;
    }

    // Si l'utilisateur n'est pas connecté, afficher les boutons de connexion et d'inscription
    if (!session) {
        return (
            <div className="flex space-x-4">
                <Button className="cursor-pointer" variant="ghost">
                    <Link href={"/login"}>
                        Connexion
                    </Link>
                </Button>
                <Button className="cursor-pointer" variant="default">
                    <Link href={"/register"}>
                        Inscription
                    </Link>
                </Button>
            </div>
        );
    }

    // Si l'utilisateur est connecté, afficher le menu utilisateur
    const avatarFallback = session.user?.name
        ? session.user.name.charAt(0).toUpperCase()
        : "?";

    const handleSignOut = async () => {
        await signOut({
            redirect: false,
        });
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
            <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="flex flex-col space-y-1 p-2 mb-2 border-b">
                    <p className="font-medium">{session.user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                </div>
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2 hover:bg-gray-100">
                    <Link href={"/profile"} className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4" />
                        <span>Mon profil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2 hover:bg-gray-100">
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-700 mt-2"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserButton;