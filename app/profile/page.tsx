// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserRound, Loader2, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UserProfileEditDialog from "@/components/user/UserProfileEditDialog";
import HardwareConfigDialog from "@/components/user/HardwareConfigDialog";
import { HardwareItem } from "@/components/user/HardwareSelectDialog";

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
  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
      // Cette fonction sera appelée si l'utilisateur n'est pas authentifié
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

  // Gérer la déconnexion de manière cohérente avec UserButton
  const handleSignOut = async () => {
    try {
      // Faire expirer la session côté client immédiatement
      await update({ expires: new Date(0).toISOString() });
      // Puis déconnecter côté serveur
      await signOut({ redirect: false });
      // Rediriger vers la page d'accueil
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    }
  };

  // Gérer la mise à jour des données utilisateur
  const handleUserUpdated = (user: User) => {
    setUserData((prev) => (prev ? { ...prev, user } : null));
  };

  // Gérer la mise à jour de la configuration matérielle
  const handleConfigUpdated = (config: UserConfig) => {
    setUserData((prev) => (prev ? { ...prev, config } : null));
  };

  // Afficher un écran de chargement
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  // Si pas de session, on ne rend rien car onUnauthenticated s'en chargera
  if (!session) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 lg:p-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <UserRound className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Mon Profil
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setUserProfileDialogOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-red-500"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-700 mb-8">
          Personnalisez votre profil et configurez votre matériel pour optimiser vos performances en jeu.
        </p>

        {/* Informations */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <section className="pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-semibold">Informations personnelles</h2>
            </div>
            {userData?.user ? (
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="font-semibold">Nom:</span> {userData.user.name}
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Email:</span> {userData.user.email}
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Statut:</span>{" "}
                  {userData.user.isAdmin ? "Administrateur" : "Utilisateur"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Information utilisateur non disponible</p>
            )}
          </section>

          {/* Configuration PC */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-semibold">Ma Configuration PC</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHardwareConfigDialogOpen(true)}
              >
                Modifier la configuration
              </Button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span>
                  Carte graphique: <span className="font-semibold">
                    {userData?.config?.gpu_id?.libelle || "Non configuré"}
                  </span>
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>
                  Processeur: <span className="font-semibold">
                    {userData?.config?.cpu_id?.libelle || "Non configuré"}
                  </span>
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>
                  Mémoire RAM: <span className="font-semibold">
                    {userData?.config?.ram_id?.libelle || "Non configuré"}
                  </span>
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>
                  Résolution d&apos;écran: <span className="font-semibold">
                    {userData?.config?.screenresolution_id?.libelle || "Non configuré"}
                  </span>
                </span>
              </li>
            </ul>
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