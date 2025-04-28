import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/user/User';

export async function GET() {
  try {
    const session = await getServerSession();
    
    // Vérification des droits admin
    if (!session?.user?.isAdmin) {
      return new NextResponse('Non autorisé', { status: 403 });
    }
    
    await connectToDatabase();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur API:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}