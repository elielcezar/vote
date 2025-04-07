import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/projects - Listar todos os projetos
export async function GET() {
  try {
    console.log('Buscando todos os projetos...');
    
    const projects = await prisma.project.findMany({
      orderBy: {
        title: 'asc'
      }
    });
    
    console.log(`Retornando ${projects.length} projetos`);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos', details: String(error) }, 
      { status: 500 }
    );
  }
}

// POST /api/projects - Criar um novo projeto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Criando novo projeto:', body);
    
    // Validação básica
    if (!body.title || !body.description || !body.presenter) {
      console.log('Erro de validação: dados incompletos');
      return NextResponse.json(
        { error: 'Título, descrição e apresentador são obrigatórios' },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        presenter: body.presenter,
      }
    });
    
    console.log('Projeto criado com sucesso:', project);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar projeto', details: String(error) },
      { status: 500 }
    );
  }
} 