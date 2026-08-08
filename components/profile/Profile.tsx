"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, UserRoundCog, Cpu, Zap, MemoryStick, Monitor } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import UserProfileEditDialog from "@/components/profile/userinfo/UserProfileEditDialog";
import HardwareConfigDialog from "@/components/profile/config/HardwareConfigDialog";
import { HardwareItem } from "@/components/profile/config/HardwareSelectDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPosts } from "@/components/profile/posts/UserPosts";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  config?: {
    gpu_id?: HardwareItem;
    cpu_id?: HardwareItem;
    ram_id?: HardwareItem;
    screenresolution_id?: HardwareItem;
  };
}

interface DialogStates {
  userProfile: boolean;
  hardwareConfig: boolean;
}

const SkeletonSection = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <Skeleton className="h-5 w-24 sm:w-32" />
        <Skeleton className="h-5 w-full sm:w-48" />
      </div>
    ))}
  </div>
);

const SectionSkeletonCard = ({ lines = 3 }: { lines?: number }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50/60">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-9 w-full sm:w-32" />
    </div>
    <div className="p-5">
      <SkeletonSection lines={lines} />
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-8 lg:p-12">
    <div className="container mx-auto space-y-8">
      <Skeleton className="h-10 w-48 md:h-12 md:w-64" />
      <Skeleton className="h-6 w-full max-w-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionSkeletonCard />
        <SectionSkeletonCard lines={4} />
      </div>
      <SectionSkeletonCard lines={2} />
    </div>
  </div>
);

const HARDWARE_CONFIGS = [
  { key: 'gpu_id' as const, label: 'Carte graphique', icon: Zap },
  { key: 'cpu_id' as const, label: 'Processeur', icon: Cpu },
  { key: 'ram_id' as const, label: 'Mémoire RAM', icon: MemoryStick, hasType: true },
  { key: 'screenresolution_id' as const, label: 'Résolution d\'écran', icon: Monitor, hasDetails: true }
];

const Profile = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogs, setDialogs] = useState<DialogStates>({
    userProfile: false,
    hardwareConfig: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (status !== "authenticated" || !session) return;

      try {
        const response = await fetch("/api/user");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const { user } = await response.json();
        setUser(user);
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error);
        toast.error("Impossible de charger vos données utilisateur");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status, session]);

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
    toast.success("Informations mises à jour avec succès");
  };

  const handleConfigUpdated = (config: User['config']) => {
    setUser(prev => prev ? { ...prev, config } : null);
    toast.success("Configuration mise à jour avec succès");
  };

  const toggleDialog = (dialog: keyof DialogStates) => {
    setDialogs(prev => ({ ...prev, [dialog]: !prev[dialog] }));
  };

  if (status === "loading") return <PageSkeleton />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-8 lg:p-12">
      <div className="container mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Mon Profil</h1>
        </header>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 -mt-4">
          Personnalisez votre profil et configurez votre matériel pour optimiser vos performances en jeu.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50/60">
              <h2 className="text-lg sm:text-xl font-semibold">Informations personnelles</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleDialog('userProfile')}
                className="w-full sm:w-auto bg-white"
                disabled={loading}
              >
                <UserRoundCog className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            </div>

            <div className="p-5">
              {loading ? <SkeletonSection /> : user ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Nom</p>
                      <p className="text-base font-semibold text-gray-900 truncate">{user.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-base font-semibold text-gray-900 break-all">{user.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Statut</p>
                      <p className="text-base font-semibold text-gray-900">{user.isAdmin ? "Administrateur" : "Utilisateur"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Les informations peuvent prendre effet après une reconnexion.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Informations utilisateur non disponibles</p>
              )}
            </div>
          </section>

          {/* Configuration PC */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50/60">
              <h2 className="text-lg sm:text-xl font-semibold">Ma Configuration PC</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleDialog('hardwareConfig')}
                className="w-full sm:w-auto bg-white"
                disabled={loading}
              >
                <Settings className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            </div>

            <div className="p-5">
              {loading ? <SkeletonSection lines={4} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HARDWARE_CONFIGS.map(({ key, label, icon: Icon, hasType, hasDetails }) => {
                    const item = user?.config?.[key];
                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {label}
                        </p>
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {item?.libelle || <span className="text-gray-400 font-normal">Non configuré</span>}
                          {hasType && item?.type && <span className="text-gray-500 italic font-normal text-sm"> ({item.type})</span>}
                          {hasDetails && item?.width && item?.height && item?.aspectRatio && (
                            <span className="text-gray-500 italic font-normal text-sm"> ({item.width}x{item.height} - {item.aspectRatio})</span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Mes posts */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50/60">
            <h2 className="text-lg sm:text-xl font-semibold">Mes publications</h2>
          </div>
          <div className="p-5">
            <UserPosts />
          </div>
        </section>

        {/* Dialogues modaux */}
        <UserProfileEditDialog
          open={dialogs.userProfile}
          onOpenChange={() => setDialogs(prev => ({ ...prev, userProfile: false }))}
          user={user}
          onUserUpdated={handleUserUpdated}
        />

        <HardwareConfigDialog
          open={dialogs.hardwareConfig}
          onOpenChange={() => setDialogs(prev => ({ ...prev, hardwareConfig: false }))}
          config={user?.config || null}
          onConfigUpdated={handleConfigUpdated}
        />
      </div>
    </div>
  );
};

export default Profile;