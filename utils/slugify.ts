export function slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-') // Évite les doubles tirets
      .trim();
  }