import Header from "@/components/header";
import "./globals.css";
import type { Metadata } from "next";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "GS Helper",
  description: "Détecte ta configuration et optimise tes jeux",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>
          <Toaster />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
