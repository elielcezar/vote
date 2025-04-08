import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Criar uma instância do cliente Prisma diretamente para evitar problemas de cache
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Dados recebidos para voto:', JSON.stringify(body, null, 2));
    
    // Verificar dados obrigatórios
    if (!body.token || !body.projectId) {
      console.log('Erro: Token ou projectId ausente', { token: body.token, projectId: body.projectId });
      return NextResponse.json(
        { error: 'Token e projectId são obrigatórios' },
        { status: 400 }
      );
    }

    try {
      // Verificar se o token é válido
      const participant = await prisma.participant.findUnique({
        where: { token: body.token }
      });
      
      if (!participant) {
        console.log('Erro: Token inválido', body.token);
        return NextResponse.json(
          { error: 'Token inválido ou participante não encontrado' },
          { status: 401 }
        );
      }
      console.log('Participante encontrado:', participant.id, participant.name);

      // Verificar se o projeto existe
      const project = await prisma.project.findUnique({
        where: { id: body.projectId }
      });
      
      if (!project) {
        console.log('Erro: Projeto não encontrado', body.projectId);
        return NextResponse.json(
          { error: 'Projeto não encontrado' },
          { status: 404 }
        );
      }
      console.log('Projeto encontrado:', project.id, project.title);

      // Verificar se o participante já votou neste projeto
      // Usando apenas os campos de ID para evitar problemas de incompatibilidade
      const existingVote = await prisma.vote.findFirst({
        where: {
          participantId: participant.id,
          projectId: body.projectId
        },
        select: {
          id: true
        }
      });
      
      console.log('Voto existente:', existingVote ? 'Sim' : 'Não');

      if (existingVote) {
        try {
          // Atualizar voto existente
          const updatedVote = await prisma.vote.update({
            where: { id: existingVote.id },
            data: {
              communicationScore: body.communicationScore,
              businessScore: body.businessScore,
              creativityScore: body.creativityScore,
              finalScore: body.finalScore,
              comment: body.comment || null,
              score: body.finalScore
            }
          });
          
          console.log('Voto atualizado com sucesso:', updatedVote);
          return NextResponse.json({ 
            success: true, 
            message: 'Voto atualizado com sucesso',
            vote: { id: updatedVote.id }
          });
        } catch (updateError) {
          console.error('Erro ao atualizar voto:', updateError);
          return NextResponse.json({ 
            error: 'Erro ao atualizar voto',
            details: String(updateError)
          }, { status: 500 });
        }
      } else {
        try {
          // Criar novo voto diretamente, evitando o uso de relacionamentos complexos
          const newVote = await prisma.vote.create({
            data: {
              communicationScore: body.communicationScore,
              businessScore: body.businessScore,
              creativityScore: body.creativityScore, 
              finalScore: body.finalScore,
              comment: body.comment || null,
              participantId: participant.id,
              projectId: body.projectId,
              score: body.finalScore
            },
            select: {
              id: true
            }
          });
          
          console.log('Novo voto registrado com sucesso:', newVote);
          return NextResponse.json({ 
            success: true, 
            message: 'Voto registrado com sucesso',
            vote: { id: newVote.id }
          }, { status: 201 });
        } catch (createError) {
          console.error('Erro ao criar voto:', createError);
          return NextResponse.json({ 
            error: 'Erro ao criar voto',
            details: String(createError)
          }, { status: 500 });
        }
      }
    } catch (dbError) {
      console.error('Erro de banco de dados:', dbError);
      return NextResponse.json({ 
        error: 'Erro ao processar operação no banco de dados',
        details: String(dbError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao processar voto:', error);
    return NextResponse.json({
      error: 'Erro ao processar voto',
      details: String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Buscando estatísticas de votos...');
    
    try {
      const projects = await prisma.project.findMany();
      console.log(`Encontrados ${projects.length} projetos`);
      
      // Buscar votos separadamente para evitar erros de tipo
      const projectIds = projects.map(p => p.id);
      console.log('IDs dos projetos:', projectIds);
      
      const votes = await prisma.vote.findMany({
        where: {
          projectId: { in: projectIds }
        },
        select: {
          id: true,
          projectId: true,
          finalScore: true
        }
      });
      console.log(`Encontrados ${votes.length} votos no total`);
      console.log('Exemplo de voto:', votes[0]);
      
      // Calcular estatísticas para cada projeto
      const projectsWithStats = projects.map(project => {
        const projectVotes = votes.filter(v => v.projectId === project.id);
        const totalVotes = projectVotes.length;
        const sumScores = projectVotes.reduce((sum, vote) => sum + vote.finalScore, 0);
        const avgScore = totalVotes > 0 ? sumScores / totalVotes : 0;
        
        return {
          id: project.id,
          title: project.title,
          presenter: project.presenter,
          totalVotes,
          averageScore: parseFloat(avgScore.toFixed(2))
        };
      });
      
      console.log('Estatísticas calculadas com sucesso:', projectsWithStats);
      return NextResponse.json(projectsWithStats);
    } catch (dbError) {
      console.error('Erro ao buscar dados do banco:', dbError);
      return NextResponse.json({
        error: 'Erro ao buscar dados do banco',
        details: String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas de votos:', error);
    return NextResponse.json({
      error: 'Erro ao buscar estatísticas de votos',
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
