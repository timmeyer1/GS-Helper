"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, UserRoundCog } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UserProfileEditDialog from "@/components/user/UserProfileEditDialog";
import HardwareConfigDialog from "@/components/user/HardwareConfigDialog";
import { HardwareItem } from "@/components/user/HardwareSelectDialog";
import { Skeleton } from "@/components/ui/skeleton";

// Types pour les données utilisateur
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface UserConfig {
  gpu_id?: HardwareItem;
  cpu_id?: HardwareItem;
  ram_id?: HardwareItem;
  screenresolution_id?: HardwareItem;
}

interface UserData {
  user: User;
  config: UserConfig | null;
}

const Profile = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);
  const [hardwareConfigDialogOpen, setHardwareConfigDialogOpen] = useState(false);

  // Charger les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session) {
        try {
          const response = await fetch("/api/user");

          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données utilisateur");
          }

          const data = await response.json() as UserData;
          setUserData(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          toast.error("Impossible de charger vos données utilisateur");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [status, session]);

  // Gérer la mise à jour des données utilisateur
  const handleUserUpdated = (user: User) => {
    setUserData((prev) => (prev ? { ...prev, user } : null));
  };

  // Gérer la mise à jour de la configuration matérielle
  const handleConfigUpdated = (config: UserConfig) => {
    setUserData((prev) => (prev ? { ...prev, config } : null));
  };

  // Composant pour le skeleton loader des informations utilisateur
  const UserInfoSkeleton = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );

  // Composant pour le skeleton loader de la configuration PC
  const HardwareConfigSkeleton = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
      ))}
    </div>
  );

  // Afficher un écran de chargement complet pendant le chargement initial
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  // Si pas de session, on ne rend rien car onUnauthenticated s'en chargera
  if (!session) return null;

  return (
    <div className="min-h-screen p-3 sm:p-5 md:p-8 lg:p-12">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Mon Profil
            </h1>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6">
          Personnalisez votre profil et configurez votre matériel pour optimiser vos performances en jeu.
        </p>

        {/* Informations */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-6">
          <section className="pb-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Informations personnelles</h2>
              <Button
                className="cursor-pointer w-full sm:w-auto"
                variant="outline"
                size="sm"
                onClick={() => setUserProfileDialogOpen(true)}
              >
                <UserRoundCog className="h-4 w-4 mr-1" />
                <span>Modifier les informations</span>
              </Button>
            </div>

            {loading ? (
              <UserInfoSkeleton />
            ) : userData?.user ? (
              <div className="space-y-2 text-sm sm:text-base">
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-semibold">Nom:</span>
                  <span className="ml-0 sm:ml-2">{userData.user.name}</span>
                </p>
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-semibold">Email:</span>
                  <span className="ml-0 sm:ml-2 break-all">{userData.user.email}</span>
                </p>
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-semibold">Statut:</span>
                  <span className="ml-0 sm:ml-2">{userData.user.isAdmin ? "Administrateur" : "Utilisateur"}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Les informations peuvent prendre effet après une reconnexion.
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Information utilisateur non disponible</p>
            )}
          </section>

          {/* Configuration PC */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Ma Configuration PC</h2>
              <Button
                className="cursor-pointer w-full sm:w-auto"
                variant="outline"
                size="sm"
                onClick={() => setHardwareConfigDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                <span>Modifier la configuration</span>
              </Button>
            </div>

            {loading ? (
              <HardwareConfigSkeleton />
            ) : (
              <ul className="space-y-3 text-sm sm:text-base">
                <li className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium">Carte graphique:</span>
                  <span className="ml-0 sm:ml-2 font-semibold">
                    {userData?.config?.gpu_id?.libelle || "Non configuré"}
                  </span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium">Processeur:</span>
                  <span className="ml-0 sm:ml-2 font-semibold">
                    {userData?.config?.cpu_id?.libelle || "Non configuré"}
                  </span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium">Mémoire RAM:</span>
                  <span className="ml-0 sm:ml-2">
                    <span className="font-semibold">
                      {userData?.config?.ram_id?.libelle || "Non configuré"}
                    </span>
                    {userData?.config?.ram_id?.type && (
                      <span className="text-gray-500 italic font-normal">
                        {" "}({userData.config.ram_id.type})
                      </span>
                    )}
                  </span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium">Résolution d&apos;écran:</span>
                  <span className="ml-0 sm:ml-2">
                    <span className="font-semibold">
                      {userData?.config?.screenresolution_id?.libelle || "Non configuré"}
                    </span>
                    {(userData?.config?.screenresolution_id?.width &&
                      userData?.config?.screenresolution_id?.height &&
                      userData?.config?.screenresolution_id?.aspectRatio) && (
                        <span className="text-gray-500 italic font-normal">
                          {" "}({userData.config.screenresolution_id.width}x{userData.config.screenresolution_id.height} - {userData.config.screenresolution_id.aspectRatio})
                        </span>
                      )}
                  </span>
                </li>
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Dialogues */}
      <UserProfileEditDialog
        open={userProfileDialogOpen}
        onOpenChange={setUserProfileDialogOpen}
        user={userData?.user || null}
        onUserUpdated={handleUserUpdated}
      />

      <HardwareConfigDialog
        open={hardwareConfigDialogOpen}
        onOpenChange={setHardwareConfigDialogOpen}
        config={userData?.config || null}
        onConfigUpdated={handleConfigUpdated}
      />
    </div>
  );
};

export default Profile;