'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import ProjectCard from '@/components/ProjectCard';
import VoteForm from '@/components/VoteForm';
import { getCookie } from 'cookies-next';
import { deleteCookie } from 'cookies-next';

interface Project {
  id: number;
  title: string;
  description: string;
  presenter: string;
}

export default function VotePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação do usuário
  useEffect(() => {
    const storedToken = localStorage.getItem('voteToken') || getCookie('voteToken')?.toString();
    
    if (!storedToken) {
      // Redirecionar para a página inicial se não tiver token
      router.push('/');
      return;
    }
    
    setToken(storedToken);
    fetchProjects();
  }, [router]);

  // Buscar projetos da API
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      console.log('Buscando projetos...');
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao buscar projetos:', errorData);
        throw new Error(errorData.error || 'Erro ao buscar projetos');
      }
      
      const data = await response.json();
      console.log(`Encontrados ${data.length} projetos`);
      setProjects(data);
    } catch (error) {
      console.error('Erro na requisição de projetos:', error);
      toast.error('Não foi possível carregar os projetos');
    } finally {
      setIsLoading(false);
    }
  };

  // Selecionar um projeto para votar
  const handleSelectProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };

  // Cancelar a votação
  const handleCancelVote = () => {
    setSelectedProject(null);
  };

  // Enviar o voto para a API
  const handleSubmitVote = async (data: { 
    projectId: number;
    communicationScore: number; 
    businessScore: number; 
    creativityScore: number;
    finalScore: number;
    comment: string 
  }) => {
    if (!token || !selectedProject) return;
    
    try {
      console.log('Enviando voto:', { 
        token, 
        projectId: selectedProject.id,
        communicationScore: data.communicationScore,
        businessScore: data.businessScore,
        creativityScore: data.creativityScore,
        finalScore: data.finalScore,
        comment: data.comment 
      });
      
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          projectId: selectedProject.id,
          communicationScore: data.communicationScore,
          businessScore: data.businessScore,
          creativityScore: data.creativityScore,
          finalScore: data.finalScore,
          comment: data.comment
        }),
      });
      
      const responseData = await response.json();
      console.log('Resposta da API:', responseData);
      
      if (!response.ok) {
        console.error('Erro da API:', responseData);
        throw new Error(responseData.error || 'Erro ao registrar voto');
      }
      
      toast.success(`Voto registrado para o projeto "${selectedProject.title}"!`);
      setSelectedProject(null);
      
      // Atualizar a lista de projetos após o voto
      fetchProjects();
    } catch (error) {
      console.error('Erro ao processar voto:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar voto');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Votação de Projetos</h1>
          {!selectedProject ? (
            <>
              <p className="text-xl text-gray-600 mb-4">
                Selecione um projeto para avaliar
              </p>

              <div className="flex gap-4 justify-center">            
                <Link href="/profile" className="text-purple-600 hover:underline">Editar meu perfil</Link>
                <button 
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('voteToken');
                      }
                      deleteCookie('voteToken');
                      setToken(null);
                      toast.success('Sessão encerrada com sucesso');
                      setTimeout(() => {
                        router.push('/');
                      }, 500);
                    }}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                  Sair
                </button>
              </div>
            </>

          ) : null}
          
        </header>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg">Carregando projetos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-lg">Nenhum projeto disponível para votação.</p>
              </div>
            ) : (
              !selectedProject && projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onVote={handleSelectProject}
                />
              ))
            )}
            
            {selectedProject && (
              <div className="col-span-full md:col-span-2 md:col-start-1 lg:col-start-2 lg:col-span-1">
                <VoteForm
                  projectId={selectedProject.id}
                  projectName={selectedProject.title}
                  projectPresenter={selectedProject.presenter}
                  projectDescription={selectedProject.description}
                  onSubmit={handleSubmitVote}
                  onCancel={handleCancelVote}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      <Toaster position="bottom-center" />
    </main>
  );
} 