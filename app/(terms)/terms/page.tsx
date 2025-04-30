import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen p-3 sm:p-5 md:p-8 lg:p-12">
            <div className="container mx-auto">
                <div className="mb-8">

                    <div className="flex items-center mb-6">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            Conditions Générales
                        </h1>
                    </div>

                    <p className="text-base sm:text-lg text-gray-700 mb-8">
                        Ces conditions générales régissent l'utilisation de GS Helper, l'outil qui vous aide à optimiser vos paramètres de jeu.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">1. Présentation du service</h2>
                        <p className="text-gray-700">
                            GS Helper est un outil permettant aux utilisateurs de trouver la configuration optimale pour leurs jeux en fonction de leur matériel informatique (carte graphique, processeur, RAM, etc.). Notre service propose également un système communautaire de votes pour mettre en avant les configurations les plus efficaces.
                        </p>
                    </section>

                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">2. Utilisation du service</h2>
                        <p className="text-gray-700">
                            En utilisant GS Helper, vous acceptez que les informations concernant votre matériel informatique soient collectées dans le seul but de vous proposer des paramètres optimisés. Vous pouvez également contribuer à la communauté en partageant vos propres configurations et en votant pour celles que vous estimez les plus efficaces.
                        </p>
                    </section>

                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">3. Responsabilité</h2>
                        <p className="text-gray-700">
                            GS Helper propose des suggestions basées sur des données communautaires et des analyses techniques. Nous ne pouvons garantir que les paramètres suggérés seront parfaitement adaptés à votre configuration spécifique. L'application de ces paramètres se fait sous votre entière responsabilité.
                        </p>
                    </section>

                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">4. Données personnelles</h2>
                        <p className="text-gray-700">
                            Nous collectons uniquement les informations techniques nécessaires au bon fonctionnement du service. Pour plus d'informations sur la gestion de vos données, veuillez consulter notre politique de confidentialité.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">5. Modifications des conditions</h2>
                        <p className="text-gray-700">
                            Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants via une notification sur notre plateforme.
                        </p>
                    </section>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Link href="/">
                        <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à l'accueil
                        </Button>
                    </Link>
                    <Link href="/privacypolicy">
                        <Button variant="purple" className="w-full sm:w-auto cursor-pointer">
                            Politique de confidentialité
                            <FileText className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}