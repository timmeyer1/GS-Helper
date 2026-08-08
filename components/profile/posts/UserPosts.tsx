"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Trophy,
  Target,
  CircleEqual,
  Edit,
  Trash2,
  GamepadIcon,
  Calendar,
  ThumbsUp,
  Search,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserPost {
  _id: string;
  game_id: number;
  game_metadata: {
    name: string;
    cover_url?: string | null;
  };
  content: string;
  settings: Record<string, string>;
  votes: { upvotes: number };
  created_at: string;
  postType: 'equilibre' | 'performance' | 'qualite';
  expectedFps: string;
}

interface Setting {
  _id: string;
  name: string;
  display_name: string;
}

// Configuration des constantes
const POST_TYPES = {
  equilibre: { icon: CircleEqual, label: 'Équilibré', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  performance: { icon: Trophy, label: 'Performance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  qualite: { icon: Target, label: 'Qualité', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
} as const;

const FPS_OPTIONS = [
  { value: '-60', label: 'Moins de 60 FPS' },
  { value: '60-80', label: '60-80 FPS' },
  { value: '80-100', label: '80-100 FPS' },
  { value: '100-120', label: '100-120 FPS' },
  { value: '+120', label: 'Plus de 120 FPS' }
];

const SETTING_VALUES = [
  { value: 'Low', label: 'Faible' },
  { value: 'Medium', label: 'Moyen' },
  { value: 'High', label: 'Élevé' },
  { value: 'Ultra', label: 'Ultra' }
];

type SortOption = 'popularity' | 'recent' | 'oldest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'oldest', label: 'Plus ancien' },
  { value: 'popularity', label: 'Popularité (votes)' }
];

const ALL_GAMES_VALUE = '__all__';

const normalizeCoverUrl = (url: string | null): string | null => {
  if (!url) return null;
  return url.startsWith('//') ? `https:${url}` : url;
};

const translateValue = (value: string) => {
  const translation = SETTING_VALUES.find(s => s.value === value)?.label ||
    FPS_OPTIONS.find(f => f.value === value)?.label;
  return translation || value;
};

const PostTypeBadge: React.FC<{ type: keyof typeof POST_TYPES }> = ({ type }) => {
  const { icon: Icon, label, color } = POST_TYPES[type];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

const PostSkeleton = () => (
  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
    <div className="flex items-start gap-3">
      <Skeleton className="h-12 w-9 rounded-md shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  </div>
);

export const UserPosts: React.FC = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<UserPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour le tri et le filtrage
  const [selectedGame, setSelectedGame] = useState<string>(ALL_GAMES_VALUE);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // États pour le formulaire d'édition
  const [editData, setEditData] = useState({
    content: '',
    postType: '',
    expectedFps: '',
    settings: {} as Record<string, string>
  });

  const fetchUserPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/user/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        toast.error('Erreur lors du chargement des posts');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/posts?settings=true');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || []);
      }
    } catch (error) {
      console.error('Erreur settings:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserPosts(), fetchSettings()]);
      setLoading(false);
    };
    loadData();
  }, [fetchUserPosts, fetchSettings]);

  // Liste des jeux sur lesquels l'utilisateur a posté (pour le filtre)
  const availableGames = useMemo(() => {
    const gamesMap = new Map<number, string>();
    posts.forEach((post) => {
      if (!gamesMap.has(post.game_id)) {
        gamesMap.set(post.game_id, post.game_metadata.name);
      }
    });
    return Array.from(gamesMap.entries())
      .map(([game_id, name]) => ({ game_id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [posts]);

  // Posts filtrés, recherchés puis triés pour l'affichage
  const displayedPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = posts;

    if (selectedGame !== ALL_GAMES_VALUE) {
      const gameId = Number(selectedGame);
      result = result.filter((post) => post.game_id === gameId);
    }

    if (query) {
      result = result.filter((post) =>
        post.content.toLowerCase().includes(query) ||
        post.game_metadata.name.toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.votes.upvotes - a.votes.upvotes;
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [posts, selectedGame, searchQuery, sortBy]);

  const handleEdit = (post: UserPost) => {
    setEditingPost(post);
    setEditData({
      content: post.content,
      postType: post.postType,
      expectedFps: post.expectedFps,
      settings: post.settings
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editData.content.trim()) {
      toast.error('Le contenu ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/user/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        toast.success('Post modifié avec succès');
        setEditingPost(null);
        fetchUserPosts();
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/user/posts/${postId}`, { method: 'DELETE' });

      if (response.ok) {
        toast.success('Post supprimé avec succès');
        setPosts(prev => prev.filter(post => post._id !== postId));
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de connexion');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleOpenPost = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center py-8">
        <GamepadIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">
          Vous n'avez encore publié aucun post
        </p>
        <p className="text-gray-400 text-sm mb-4">
          Commencez à partager vos configurations gaming !
        </p>
        <Button onClick={() => router.push('/search')}>
          Explorer les jeux
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Barre de filtres */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <Label className="text-xs text-gray-500 mb-1 block">Jeu</Label>
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_GAMES_VALUE}>Tous les jeux</SelectItem>
              {availableGames.map(({ game_id, name }) => (
                <SelectItem key={game_id} value={String(game_id)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-0">
          <Label className="text-xs text-gray-500 mb-1 block">Trier par</Label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-[2] min-w-0">
          <Label className="text-xs text-gray-500 mb-1 block">Rechercher</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans vos posts..."
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {displayedPosts.length === 0 ? (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center py-8">
          <p className="text-gray-500">Aucun post ne correspond à ces critères</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedPosts.map((post) => (
            <div
              key={post._id}
              role="link"
              tabIndex={0}
              onClick={() => handleOpenPost(post._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenPost(post._id);
                }
              }}
              className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {normalizeCoverUrl(post.game_metadata.cover_url) && (
                  <img
                    src={normalizeCoverUrl(post.game_metadata.cover_url)!}
                    alt={`Couverture de ${post.game_metadata.name}`}
                    className="w-9 h-12 object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base flex items-center gap-1.5 truncate">
                      {post.game_metadata.name}
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </h3>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(post);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(post._id);
                        }}
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {post.votes.upvotes}
                    </span>
                    <PostTypeBadge type={post.postType} />
                    <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {translateValue(post.expectedFps)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de modification */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la publication</DialogTitle>
            <DialogDescription>
              Modifiez votre post pour {editingPost?.game_metadata.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Votre expérience</Label>
              <Textarea
                value={editData.content}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Partagez votre expérience avec ces réglages..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Orientation du post</Label>
                <Select
                  value={editData.postType}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, postType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POST_TYPES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>FPS attendus</Label>
                <Select
                  value={editData.expectedFps}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, expectedFps: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FPS_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Paramètres graphiques</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {settings.map((setting) => (
                  <div key={setting._id} className="space-y-1">
                    <Label className="text-sm">{setting.display_name}</Label>
                    <Select
                      value={editData.settings[setting.name] || ''}
                      onValueChange={(value) =>
                        setEditData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, [setting.name]: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {SETTING_VALUES.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};