import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/projects - Listar todos os projetos
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        title: 'asc'
      }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' }, 
      { status: 500 }
    );
  }
}

// POST /api/projects - Criar um novo projeto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.title || !body.description || !body.presenter) {
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
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
} 