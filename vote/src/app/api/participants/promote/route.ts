/**
* 
// concede privilegios de administrador a um participante 
*
**/
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/participants/promote - Promover um participante a administrador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.email || !body.adminToken) {
      return NextResponse.json(
        { error: 'Email e adminToken são obrigatórios' },
        { status: 400 }
      );
    }    
    
    const ADMIN_SECRET = process.env.ADMIN_SECRET_TOKEN;
    
    if (body.adminToken !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Token de administrador inválido' },
        { status: 401 }
      );
    }
    
    // Buscar participante pelo email
    const participant = await prisma.participant.findUnique({
      where: { email: body.email }
    });
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      );
    }
    
    // Atualizar o papel do participante para "admin"
    const updatedParticipant = await prisma.participant.update({
      where: { id: participant.id },
      data: { role: 'admin' }
    });
    
    return NextResponse.json({
      success: true,
      message: `${updatedParticipant.name} agora é um administrador`,
      participant: {
        id: updatedParticipant.id,
        name: updatedParticipant.name,
        email: updatedParticipant.email,
        role: updatedParticipant.role
      }
    });
  } catch (error) {
    console.error('Error promoting participant:', error);
    return NextResponse.json(
      { error: 'Erro ao promover participante' },
      { status: 500 }
    );
  }
} 