import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// GET /api/participants - Listar todos os participantes
export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar participantes' },
      { status: 500 }
    );
  }
}

// POST /api/participants - Registrar um novo participante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se o email já está registrado
    const existingParticipant = await prisma.participant.findUnique({
      where: { email: body.email }
    });
    
    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Este email já está registrado' },
        { status: 400 }
      );
    }
    
    // Gerar token único para o participante
    const token = crypto.randomBytes(16).toString('hex');
    
    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const participant = await prisma.participant.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        token: token
      }
    });
    
    const participantResponse = {
      id: participant.id,
      name: participant.name,
      email: participant.email,
      token: participant.token,
      role: participant.role,
      createdAt: participant.createdAt
    };
    
    return NextResponse.json(participantResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar participante' },
      { status: 500 }
    );
  }
} 