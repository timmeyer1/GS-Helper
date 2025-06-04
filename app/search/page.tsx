import SearchPageClient from '@/components/search/SearchPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Rechercher un jeu",
    description: "Détecte ta configuration et optimise tes jeux",
    icons: {
        icon: '/logo/logo_hover.png',
    },
};

// Fonction serveur pour récupérer les nouveaux jeux au moment du build/rendu
async function getNewGames() {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const oneYearAgo = currentTime - 60 * 60 * 24 * 365; // 1 an en arrière

        const baseUrl = process.env.BASE_URL;
        
        const response = await fetch(`${baseUrl}/api/igdb`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpoint: 'games',
                query: `
                    fields name, cover.image_id, first_release_date, rating, total_rating, hypes;
                    where first_release_date > ${oneYearAgo}
                    & first_release_date < ${currentTime}
                    & cover != null 
                    & hypes >= 33
                    & platforms = (6);
                    sort first_release_date desc;
                    limit 30;
                `
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des nouveaux jeux populaires:', error);
        return [];
    }
}

export default async function SearchPage() {
    // Récupération des données côté serveur
    const initialNewGames = await getNewGames();

    return (
        <SearchPageClient initialNewGames={initialNewGames} />
    );
}