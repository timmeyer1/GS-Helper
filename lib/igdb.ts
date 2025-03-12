// lib/igdb.ts
import axios from 'axios';

// Interface pour la réponse d'authentification Twitch
interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  // Vérifie si le token existe et est valide
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken;
  }

  try {
    const response = await axios.post<TwitchAuthResponse>(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    );

    accessToken = response.data.access_token;
    // Conversion en millisecondes et soustraction de 10 minutes pour marge de sécurité
    tokenExpiry = Date.now() + (response.data.expires_in - 600) * 1000;
    
    return accessToken;
  } catch (error) {
    console.error("Erreur lors de l'obtention du token:", error);
    throw error;
  }
}

export async function fetchFromIGDB<T>(endpoint: string, query: string): Promise<T> {
  const token = await getAccessToken();
  
  try {
    const response = await axios<T>({
      url: `https://api.igdb.com/v4/${endpoint}`,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.TWITCH_CLIENT_ID as string,
        'Authorization': `Bearer ${token}`
      },
      data: query
    });
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la requête à ${endpoint}:`, error);
    throw error;
  }
}