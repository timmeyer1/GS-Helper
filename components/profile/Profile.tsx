"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, UserRoundCog } from "lucide-react";
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

const SectionSkeleton = ({ title, lines = 3 }: { title: string; lines?: number }) => (
  <section className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-full sm:w-64" />
    </div>
    <SkeletonSection lines={lines} />
  </section>
);

const PageSkeleton = () => (
  <div className="min-h-screen p-3 sm:p-5 md:p-8 lg:p-12">
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-10 w-48 md:h-12 md:w-64" />
      </div>
      <Skeleton className="h-6 w-full max-w-lg" />
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-6">
        <SectionSkeleton title="Informations personnelles" />
        <SectionSkeleton title="Ma Configuration PC" lines={4} />
        <SectionSkeleton title="Mes posts" lines={2} />
      </div>
    </div>
  </div>
);

const HARDWARE_CONFIGS = [
  { key: 'gpu_id' as const, label: 'Carte graphique' },
  { key: 'cpu_id' as const, label: 'Processeur' },
  { key: 'ram_id' as const, label: 'Mémoire RAM', hasType: true },
  { key: 'screenresolution_id' as const, label: 'Résolution d\'écran', hasDetails: true }
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
    <div className="min-h-screen p-3 sm:p-5 md:p-8 lg:p-12">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Mon Profil</h1>
        </header>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6">
          Personnalisez votre profil et configurez votre matériel pour optimiser vos performances en jeu.
        </p>

        <main className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-6">
          {/* Informations personnelles */}
          <section className="pb-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Informations personnelles</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleDialog('userProfile')}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <UserRoundCog className="h-4 w-4 mr-1" />
                Modifier les informations
              </Button>
            </div>

            {loading ? <SkeletonSection /> : user ? (
              <div className="space-y-2 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-semibold">Nom:</span>
                  <span className="sm:ml-2">{user.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-semibold">Email:</span>
                  <span className="sm:ml-2 break-all">{user.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-semibold">Statut:</span>
                  <span className="sm:ml-2">{user.isAdmin ? "Administrateur" : "Utilisateur"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Les informations peuvent prendre effet après une reconnexion.
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Informations utilisateur non disponibles</p>
            )}
          </section>

          {/* Configuration PC */}
          <section className="pb-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Ma Configuration PC</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleDialog('hardwareConfig')}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <Settings className="h-4 w-4 mr-1" />
                Modifier la configuration
              </Button>
            </div>

            {loading ? <SkeletonSection lines={4} /> : (
              <div className="space-y-3 text-sm sm:text-base">
                {HARDWARE_CONFIGS.map(({ key, label, hasType, hasDetails }) => {
                  const item = user?.config?.[key];
                  return (
                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="font-medium">{label}:</span>
                      <span className="sm:ml-2">
                        <span className="font-semibold">{item?.libelle || "Non configuré"}</span>
                        {hasType && item?.type && <span className="text-gray-500 italic font-normal"> ({item.type})</span>}
                        {hasDetails && item?.width && item?.height && item?.aspectRatio && (
                          <span className="text-gray-500 italic font-normal"> ({item.width}x{item.height} - {item.aspectRatio})</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Mes posts */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Mes publications</h2>
            </div>
            <UserPosts />
          </section>
        </main>

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