import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Profile from "@/components/profile/Profile";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <Profile />;
}

// Métadonnées de la page
export const metadata = {
  title: "Mon Profil",
  description: "Personnalisez votre profil et configurez votre matériel pour optimiser vos performances en jeu.",
};