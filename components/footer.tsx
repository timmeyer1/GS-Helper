import Link from "next/link";
import { Button } from "./ui/button";

const Footer = () => {
    return (
        <footer className="bg-white border-t p-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left shadow-sm w-full">
            <div className="text-xl font-bold text-gray-800">GS Helper</div>
            <div className="text-gray-500 text-sm mt-4 md:mt-0 flex space-x-4 items-center">
                <Link href="#" className="hover:text-gray-900 transition">
                    <Button variant="ghost" className="cursor-pointer">
                        Privacy Policy
                    </Button>
                </Link>
                <Link href="#" className="hover:text-gray-900 transition">
                    <Button variant="ghost" className="cursor-pointer">
                        Terms & Conditions
                    </Button>
                </Link>
                <span className="text-sm text-gray-500">  Tous droits réservés. &copy; {new Date().getFullYear()} GS Helper.</span>
            </div>
        </footer>
    );
};


export default Footer;