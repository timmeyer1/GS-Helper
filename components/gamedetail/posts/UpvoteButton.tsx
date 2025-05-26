import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../../ui/button';
import { Plus, Minus } from 'lucide-react';

interface UpvoteButtonProps {
  postId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  hasUserVoted: boolean;
  onVoteChange?: (newUpvotes: number, newDownvotes: number, hasUserVoted: boolean) => void;
}

export const UpvoteButton: React.FC<UpvoteButtonProps> = ({
  postId,
  initialUpvotes,
  initialDownvotes,
  hasUserVoted,
  onVoteChange
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userHasVoted, setUserHasVoted] = useState(hasUserVoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async () => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Si on charge encore la session, ne rien faire
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setUserHasVoted(data.hasUserVoted);
        
        // Notifier le parent du changement
        if (onVoteChange) {
          onVoteChange(data.upvotes, data.downvotes, data.hasUserVoted);
        }
      } else if (response.status === 401) {
        // Non autorisé, rediriger vers la connexion
        router.push('/login');
      } else {
        console.error('Erreur lors du vote');
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const netScore = upvotes - downvotes;

  return (
    <div
      onClick={handleVote}
      className={`
        flex items-center gap-1 bg-white text-gray-700 border-2 text-xs font-semibold px-2 py-1 rounded-full shadow-md transition-all cursor-pointer
        ${userHasVoted 
          ? 'bg-blue-50 text-blue-700' 
          : 'hover:bg-gray-50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {userHasVoted ? (
        <Minus size={12} className="text-red-500" />
      ) : (
        <Plus size={12} className="text-green-500" />
      )}
      <span>Upvote: +{netScore}</span>
    </div>
  );
};