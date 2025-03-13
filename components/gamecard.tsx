import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Game = {
    id: number;
    name: string;
    cover?: { image_id: string }
};

interface GameCardProps {
    game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
    return (
        // <Link href={`/games/${game.id}`} className="group">
        <Link href={`/games/${game.id}`} className="group">

            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md transition-all duration-300 
                            group-hover:shadow-[0_0_8px_3px_rgba(192,132,252,1)]">
                <Image
                    src={game.cover
                        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
                        : '/placeholder-game.jpg'
                    }
                    alt={game.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <h2 className="mt-2 text-sm sm:text-base font-medium group-hover:text-purple-600 line-clamp-2">{game.name}</h2>
        </Link>
    );
};

export default GameCard;
