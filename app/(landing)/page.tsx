import Image from "next/image";
import { Gamepad2, MonitorCog } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        // <div className="min-h-full flex flex-col pt-12">
        //     <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
        //         <div className="max-w-3xl space-y-4">
        //             <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        //                 Les meilleurs <span className="underline">réglages</span> pour vos jeux
        //             </h1>
        //             <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        //                 GS Helper permet de trouver les meilleurs réglages pour vos jeux en fonction de votre configuration.
        //             </h3>
        //             <div className="flex gap-4 justify-center">
        //                 <Button variant={"blue"} className="cursor-pointer">
        //                     Analyser mes périphériques
        //                     <MonitorCog className="h-4 w-4" />
        //                 </Button>
        //                 <Button variant={"purple"} className="cursor-pointer">
        //                     Parcourir les jeux
        //                     <Gamepad2 className="h-4 w-4" />
        //                 </Button>
        //             </div>
        //         </div>
        //     </div>
        // </div>
        <div className="min-h-full flex flex-col lg:flex-row items-center justify-around p-6 sm:p-8 md:p-12 lg:p-16">
            <div className="space-y-6 sm:space-y-8 max-w-full sm:max-w-3xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    Les meilleurs <span className="underline">réglages</span> pour vos jeux
                </h1>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-700">
                    GS Helper permet de trouver les meilleurs réglages pour vos jeux en fonction de votre configuration.
                </h3>
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-4">
                    <Button variant="blue" className="cursor-pointer" size={"lg"}>
                        Analyser mes périphériques
                        <MonitorCog className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="purple" className="cursor-pointer" size={"lg"}>
                        Parcourir les jeux
                        <Gamepad2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                </div>
            </div>
            <div className="mt-8 lg:mt-0">
                <Image
                    src="/image2.png"
                    alt="Laptop"
                    width={600}
                    height={600}
                />
            </div>
        </div>
    )
}
