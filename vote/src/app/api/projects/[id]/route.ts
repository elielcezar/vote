import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/projects/[id] - Buscar um projeto específico
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projeto' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Atualizar um projeto
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se o projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validação básica
    if (!body.title || !body.description || !body.presenter) {
      return NextResponse.json(
        { error: 'Título, descrição e apresentador são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Atualizar o projeto
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        presenter: body.presenter,
      }
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Excluir um projeto
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se o projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }
    
    // Excluir todos os votos relacionados ao projeto
    await prisma.vote.deleteMany({
      where: { projectId: id }
    });
    
    // Excluir o projeto
    await prisma.project.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Projeto excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir projeto' },
      { status: 500 }
    );
  }
} 