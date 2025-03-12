import { NextRequest, NextResponse } from 'next/server';
import { fetchFromIGDB } from '@/lib/igdb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, query } = body;
    
    if (!endpoint || !query) {
      return NextResponse.json({ error: 'Endpoint et query sont requis' }, { status: 400 });
    }
    
    const data = await fetchFromIGDB(endpoint, query);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API IGDB:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}