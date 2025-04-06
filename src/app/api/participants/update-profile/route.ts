import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PUT /api/participants/update-profile - Atualizar perfil do participante
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.token || !body.name || !body.email) {
      return NextResponse.json(
        { error: 'Token, nome e email são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Buscar participante pelo token
    const participant = await prisma.participant.findUnique({
      where: { token: body.token }
    });
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se o email já está em uso por outro participante
    if (body.email !== participant.email) {
      const existingParticipant = await prisma.participant.findUnique({
        where: { email: body.email }
      });
      
      if (existingParticipant && existingParticipant.id !== participant.id) {
        return NextResponse.json(
          { error: 'Este email já está em uso por outro participante' },
          { status: 400 }
        );
      }
    }
    
    // Preparar dados para atualização
    const updateData: {
      name: string;
      email: string;
      password?: string;
    } = {
      name: body.name,
      email: body.email,
    };
    
    // Atualizar senha se necessário
    if (body.newPassword) {
      // Gerar hash da nova senha
      updateData.password = await bcrypt.hash(body.newPassword, 10);
    }
    
    // Atualizar o participante
    const updatedParticipant = await prisma.participant.update({
      where: { id: participant.id },
      data: updateData
    });
    
    // Criar objeto de resposta sem incluir a senha
    const responseParticipant = {
      id: updatedParticipant.id,
      name: updatedParticipant.name,
      email: updatedParticipant.email,
      token: updatedParticipant.token,
      role: updatedParticipant.role,
      createdAt: updatedParticipant.createdAt
    };
    
    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      participant: responseParticipant
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
} 