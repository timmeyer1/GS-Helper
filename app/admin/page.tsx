import { MonitorCog, Gamepad2, Users, PlusCircle, Edit, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Admin() {
    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-10 lg:p-16">
            {/* En-tête */}
            <div className="w-full max-w-6xl mx-auto mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                    Tableau de <span className="underline">bord</span> administrateur
                </h1>
                <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-700">
                    Gérez les jeux et les utilisateurs de GS Helper depuis cette interface.
                </h3>
            </div>

            {/* Section des jeux */}
            <div className="w-full max-w-6xl mx-auto mb-12">
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold flex items-center mb-6">
                        <Gamepad2 className="mr-3 h-7 w-7" />
                        Gestion des jeux
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="blue" className="cursor-pointer" size="lg">
                            Ajouter un jeu
                            <PlusCircle className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="cursor-pointer" size="lg">
                            Modifier un jeu
                            <Edit className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Section des utilisateurs */}
            <div className="w-full max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold flex items-center mb-6">
                        <Users className="mr-3 h-7 w-7" />
                        Gestion des utilisateurs
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="purple" className="cursor-pointer" size="lg">
                            Ajouter un utilisateur
                            <PlusCircle className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="cursor-pointer" size="lg">
                            Modifier un utilisateur
                            <Edit className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}