import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/auth/login - Autenticar um participante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Buscar participante pelo email
    const participant = await prisma.participant.findUnique({
      where: { email: body.email }
    });
    
    // Se não encontrar ou a senha estiver incorreta
    if (!participant || !participant.password || !(await bcrypt.compare(body.password, participant.password))) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }
    
    // Montar resposta sem incluir a senha
    const participantResponse = {
      id: participant.id,
      name: participant.name,
      email: participant.email,
      token: participant.token,
      role: participant.role,
      createdAt: participant.createdAt
    };
    
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      participant: participantResponse
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Erro durante o login' },
      { status: 500 }
    );
  }
} 