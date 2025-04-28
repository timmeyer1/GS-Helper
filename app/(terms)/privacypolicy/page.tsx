import { ArrowLeft, Lock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-10 lg:p-16">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    
                    <div className="flex items-center mb-6">
                        <Lock className="h-8 w-8 text-purple-600 mr-3" />
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            Politique de Confidentialité
                        </h1>
                    </div>
                    
                    <p className="text-base sm:text-lg text-gray-700 mb-8">
                        GS Helper s'engage à protéger vos données personnelles et à garantir la transparence sur les informations collectées.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">1. Informations collectées</h2>
                        <p className="text-gray-700">
                            Pour fonctionner efficacement, GS Helper collecte des informations techniques sur votre configuration matérielle, notamment :
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-gray-700">
                            <li>Modèle de carte graphique</li>
                            <li>Processeur (CPU)</li>
                            <li>Quantité de RAM</li>
                            <li>Système d'exploitation</li>
                            <li>Les jeux pour lesquels vous recherchez des paramètres</li>
                        </ul>
                    </section>

                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">2. Utilisation des données</h2>
                        <p className="text-gray-700">
                            Les informations collectées sont utilisées uniquement pour :
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-gray-700">
                            <li>Vous suggérer des paramètres de jeu optimisés</li>
                            <li>Améliorer la pertinence des recommandations communautaires</li>
                            <li>Analyser les tendances générales d'utilisation pour améliorer le service</li>
                        </ul>
                    </section>

                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">3. Partage des données</h2>
                        <p className="text-gray-700">
                            Vos configurations matérielles peuvent être partagées de manière anonyme avec la communauté lorsque vous contribuez aux recommandations. Aucune information personnelle identifiable n'est partagée avec des tiers.
                        </p>
                    </section>

                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">4. Sécurité</h2>
                        <p className="text-gray-700">
                            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès non autorisé, modification, divulgation ou destruction.
                        </p>
                    </section>

                    <section className="pb-4 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">5. Vos droits</h2>
                        <p className="text-gray-700">
                            Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles à tout moment. Si vous souhaitez exercer ces droits, contactez-nous via la section contact de notre site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3">6. Modifications de la politique</h2>
                        <p className="text-gray-700">
                            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications importantes seront notifiées aux utilisateurs par le biais de notre plateforme.
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
                    <Link href="/terms">
                        <Button variant="blue" className="w-full sm:w-auto cursor-pointer">
                            Conditions générales
                            <FileText className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}