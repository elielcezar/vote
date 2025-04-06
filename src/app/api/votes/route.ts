import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/votes - Obter estatísticas de votos
export async function GET() {
  try {
    // Buscar projetos com contagem e média de votos
    const projectStats = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        presenter: true,
        _count: {
          select: { votes: true }
        },
        votes: {
          select: {
            score: true
          }
        }
      }
    });

    // Calcular média de votos para cada projeto
    const projectsWithStats = projectStats.map(project => {
      const totalVotes = project._count.votes;
      const sumScores = project.votes.reduce((sum, vote) => sum + vote.score, 0);
      const avgScore = totalVotes > 0 ? sumScores / totalVotes : 0;
      
      return {
        id: project.id,
        title: project.title,
        presenter: project.presenter,
        totalVotes,
        averageScore: parseFloat(avgScore.toFixed(2))
      };
    });
    
    return NextResponse.json(projectsWithStats);
  } catch (error) {
    console.error('Error fetching vote statistics:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas de votos' },
      { status: 500 }
    );
  }
}

// POST /api/votes - Registrar um voto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.token || !body.projectId || !body.score) {
      return NextResponse.json(
        { error: 'Token, projectId e score são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o token é válido
    const participant = await prisma.participant.findUnique({
      where: { token: body.token }
    });
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: body.projectId }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o participante já votou neste projeto
    const existingVote = await prisma.vote.findFirst({
      where: {
        participantId: participant.id,
        projectId: body.projectId
      }
    });

    if (existingVote) {
      // Atualizar voto existente
      const updatedVote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          score: body.score,
          comment: body.comment || existingVote.comment
        }
      });
      
      return NextResponse.json(updatedVote);
    } else {
      // Criar novo voto
      const vote = await prisma.vote.create({
        data: {
          score: body.score,
          comment: body.comment || null,
          participantId: participant.id,
          projectId: body.projectId
        }
      });
      
      return NextResponse.json(vote, { status: 201 });
    }
  } catch (error) {
    console.error('Error registering vote:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar voto' },
      { status: 500 }
    );
  }
} 