import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/participants/validate - Validar token de um participante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }
    
    // Buscar participante pelo token
    const participant = await prisma.participant.findUnique({
      where: { token: body.token },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!participant) {
      return NextResponse.json(
        { valid: false, error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      participant
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Erro ao validar token' },
      { status: 500 }
    );
  }
} 