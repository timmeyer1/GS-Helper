"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Trophy,
  Target,
  CircleEqual,
  Edit,
  Trash2,
  MoreVertical,
  GamepadIcon,
  Calendar,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserPost {
  _id: string;
  game_id: number;
  game_metadata: {
    name: string;
    cover_url?: string;
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
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-md" />
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-8" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-4 w-16" />
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center py-8">
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
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {post.game_metadata.cover_url && (
                  <img
                    src={post.game_metadata.cover_url}
                    alt={`Couverture de ${post.game_metadata.name}`}
                    className="w-12 h-16 object-cover rounded-md"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {post.game_metadata.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {post.votes.upvotes} vote{post.votes.upvotes !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(post)} className="cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteConfirm(post._id)}
                    className="cursor-pointer text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <PostTypeBadge type={post.postType} />
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {translateValue(post.expectedFps)}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {post.content}
            </p>

            {post.settings && Object.keys(post.settings).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Paramètres graphiques:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(post.settings).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-gray-600 dark:text-gray-400">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="font-medium">
                        {translateValue(String(value))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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