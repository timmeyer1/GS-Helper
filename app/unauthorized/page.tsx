import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Accès refusé</h1>
      <p className="text-lg text-center mb-6">
        Vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Retour à l'accueil
      </Link>
    </div>
  );
}