import Image from 'next/image';
import { MonitorCog, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row lg:justify-around p-4 sm:p-6 md:p-10 lg:p-16">
            <div className="space-y-4 lg:space-y-6 w-full lg:w-2/5 max-w-xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    Les meilleurs réglages pour vos jeux
                </h1>
                <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-700">
                    GS Helper permet de trouver les meilleurs réglages pour vos jeux en fonction de votre configuration.
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <Link href="/profile">
                        <Button variant="blue" className="w-full sm:w-auto cursor-pointer" size="lg">
                            Choisir mes périphériques
                            <MonitorCog className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/search">
                        <Button variant="purple" className="w-full sm:w-auto cursor-pointer" size="lg">
                            Parcourir les jeux
                            <Gamepad2 className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="hidden lg:block">
                <Image
                    src="/laptop.png"
                    alt="Laptop"
                    width={600}
                    height={600}
                    className="max-w-full h-auto"
                    priority
                />
            </div>
        </div>
    );
}