import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.isAdmin) {
      return new NextResponse('Non autorisé', { status: 403 });
    }
    
    const { id } = params;
    const body = await request.json();
    
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');
    
    if (!user) {
      return new NextResponse('Utilisateur non trouvé', { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur API:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.isAdmin) {
      return new NextResponse('Non autorisé', { status: 403 });
    }
    
    const { id } = params;
    
    await connectToDatabase();
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return new NextResponse('Utilisateur non trouvé', { status: 404 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}