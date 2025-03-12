// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction pour formater des nombres en format lisible
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

// Fonction pour convertir les timestamps UNIX en date lisible
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Fonction pour construire les URLs des images IGDB
export function getIGDBImageUrl(imageId: string, size: 'cover_small' | 'cover_big' | 'screenshot_big' = 'cover_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}