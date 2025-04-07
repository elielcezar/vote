'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import Button from '@/components/Button';

interface Project {
  id: number;
  title: string;
  description: string;
  presenter: string;
}

interface ProjectStats {
  id: number;
  title: string;
  presenter: string;
  totalVotes: number;
  averageScore: number;
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  //const [statsError, setStatsError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    presenter: ''
  });

  // Buscar projetos e estatísticas
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Primeiro carregamos os projetos
        await fetchProjects();
        
        // Depois tentamos carregar as estatísticas
        await fetchProjectStats();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Buscar projetos da API
  const fetchProjects = async () => {
    try {
      console.log('Buscando projetos para o admin...');
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao buscar projetos:', errorData);
        throw new Error(errorData.error || 'Erro ao buscar projetos');
      }
      
      const data = await response.json();
      console.log('Projetos encontrados:', data);
      console.log(`Total de ${data.length} projetos encontrados`);
      
      if (!Array.isArray(data)) {
        console.error('Dados recebidos não são um array:', data);
        throw new Error('Formato de dados inválido');
      }
      
      setProjects(data);
      
      // Se não houver projetos, criar alguns projetos de exemplo
      if (data.length === 0) {
        console.log('Nenhum projeto encontrado, criando projetos de exemplo...');
        await createSampleProjects();
      }
    } catch (error) {
      console.error('Erro completo ao buscar projetos:', error);
      toast.error('Não foi possível carregar os projetos');
    }
  };

  // Buscar estatísticas de votos
  const fetchProjectStats = async () => {
    try {
      console.log('Buscando estatísticas de votos...');
      const response = await fetch('/api/votes');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao buscar estatísticas:', errorData);
        throw new Error(errorData.error || 'Erro ao buscar estatísticas');
      }
      
      const data = await response.json();
      console.log('Estatísticas recebidas:', data);
      
      // Verificar se os dados têm a estrutura esperada
      const validData = Array.isArray(data) && data.every(item => 
        typeof item === 'object' && 
        'id' in item && 
        'title' in item && 
        'presenter' in item && 
        'totalVotes' in item && 
        'averageScore' in item
      );
      
      if (!validData) {
        console.error('Formato de dados inválido recebido da API:', data);
        throw new Error('Formato de dados inválido recebido da API');
      }
      
      const typedData: ProjectStats[] = data;
      
      // Garantir que temos todos os projetos nas estatísticas
      if (projects.length > 0 && typedData.length < projects.length) {
        console.log('Projetos faltando nas estatísticas, adicionando-os...');
        // Adicionar projetos que estão faltando nas estatísticas
        const statsMap = new Map(typedData.map(stat => [stat.id, stat]));
        
        const completeStats: ProjectStats[] = projects.map(project => {
          const existingStat = statsMap.get(project.id);
          if (existingStat) {
            return existingStat;
          } else {
            // Criar estatística padrão para projeto sem votos
            return {
              id: project.id,
              title: project.title,
              presenter: project.presenter,
              totalVotes: 0,
              averageScore: 0
            };
          }
        });
        
        setProjectStats(completeStats);
      } else {
        setProjectStats(typedData);
      }
    } catch (error) {
      console.error('Erro completo:', error);
      toast.error('Não foi possível carregar as estatísticas');
    }
  };

  // Lidar com alterações no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Abrir formulário para editar projeto
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      presenter: project.presenter
    });
    setShowNewProjectForm(true);
  };

  // Enviar formulário para criar/editar projeto
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.presenter) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    
    try {
      let response;
      
      if (editingProject) {
        // Atualizar projeto existente
        response = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Criar novo projeto
        response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao salvar projeto');
      }
      
      // Limpar formulário e recarregar dados
      setFormData({ title: '', description: '', presenter: '' });
      setShowNewProjectForm(false);
      setEditingProject(null);
      
      toast.success(editingProject ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!');
      
      // Atualizar listas
      fetchProjects();
      fetchProjectStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar projeto');
    }
  };

  // Adicionar função para excluir projeto
  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao excluir projeto');
      }
      
      toast.success('Projeto excluído com sucesso!');
      
      // Atualizar listas
      fetchProjects();
      fetchProjectStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir projeto');
    }
  };

  // Criar projetos de exemplo
  const createSampleProjects = async () => {
    try {
      const sampleProjects = [
        {
          title: 'Sistema de Votação Online',
          description: 'Um sistema completo para realizar votações em eventos e apresentações, com painel administrativo e resultados em tempo real.',
          presenter: 'Equipe Alpha'
        },
        {
          title: 'Aplicativo de Gestão Financeira',
          description: 'Solução para controle de finanças pessoais, com categorização automática, metas e relatórios detalhados.',
          presenter: 'Equipe Beta'
        },
        {
          title: 'Plataforma de Aprendizado Colaborativo',
          description: 'Ambiente virtual para aprendizado em grupo, com compartilhamento de recursos, videoconferências e ferramentas de avaliação.',
          presenter: 'Equipe Gamma'
        }
      ];
      
      for (const project of sampleProjects) {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project),
        });
      }
      
      toast.success('Projetos de exemplo criados! Recarregando...');
      fetchProjects(); // Buscar projetos novamente
    } catch (error) {
      console.error('Erro ao criar projetos de exemplo:', error);
      toast.error('Erro ao criar projetos de exemplo');
    }
  };

  // Componente para renderizar a tabela de projetos
  const renderProjectsTable = () => {
    // Se não temos projetos nem estatísticas, mostrar mensagem
    if (projects.length === 0 && projectStats.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="py-4 px-4 text-center">
            Nenhum projeto cadastrado ainda.
          </td>
        </tr>
      );
    }
    
    // Se temos projetos mas não temos estatísticas, mostrar os projetos sem estatísticas
    if (projects.length > 0 && projectStats.length === 0) {
      return projects.map(project => (
        <tr key={project.id} className="border-t">
          <td className="py-3 px-4">{project.title}</td>
          <td className="py-3 px-4">{project.presenter}</td>
          <td className="py-3 px-4 text-center">0</td>
          <td className="py-3 px-4 text-center font-semibold">0.0</td>
          <td className="py-3 px-4 text-center">
            <div className="flex justify-center gap-2">
              <Button 
                onClick={() => handleEditProject(project)} 
                size="small"
                variant="primary"
              >
                Editar
              </Button>
              <Button 
                onClick={() => handleDeleteProject(project.id)} 
                size="small"
                variant="danger"
              >
                Excluir
              </Button>
            </div>
          </td>
        </tr>
      ));
    }
    
    // Se temos estatísticas, usar elas
    return projectStats.map(stat => {
      // Encontrar o projeto completo para obter todos os dados
      const project = projects.find(p => p.id === stat.id);
      return (
        <tr key={stat.id} className="border-t">
          <td className="py-3 px-4">{stat.title}</td>
          <td className="py-3 px-4">{stat.presenter}</td>
          <td className="py-3 px-4 text-center">{stat.totalVotes}</td>
          <td className="py-3 px-4 text-center font-semibold">
            {stat.averageScore.toFixed(1)}
          </td>
          <td className="py-3 px-4 text-center">
            <div className="flex justify-center gap-2">
              <Button 
                onClick={() => project && handleEditProject(project)} 
                size="small"
                variant="primary"
              >
                Editar
              </Button>
              <Button 
                onClick={() => handleDeleteProject(stat.id)} 
                size="small"
                variant="danger"
              >
                Excluir
              </Button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Painel Administrativo</h1>
          <p className="text-xl text-gray-600 mb-4">
            Gerencie projetos e veja estatísticas de votação
          </p>
          <Link href="/" className="text-blue-600 hover:underline">Voltar para página inicial</Link>
        </header>

        {/* Botão para adicionar novo projeto */}
        <div className="mb-8 flex justify-center">
          <Button 
            onClick={() => {
              setEditingProject(null);
              setFormData({ title: '', description: '', presenter: '' });
              setShowNewProjectForm(!showNewProjectForm);
            }}
            variant={showNewProjectForm ? 'secondary' : 'primary'}
          >
            {showNewProjectForm ? 'Cancelar' : 'Adicionar Novo Projeto'}
          </Button>
        </div>

        {/* Formulário para novo projeto */}
        {showNewProjectForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <form onSubmit={handleSubmitProject}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Título do Projeto
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o título do projeto"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="presenter" className="block text-gray-700 font-medium mb-2">
                  Apresentador
                </label>
                <input
                  id="presenter"
                  name="presenter"
                  type="text"
                  value={formData.presenter}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do apresentador"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva o projeto"
                  required
                />
              </div>
              
              <Button type="submit" fullWidth>
                {editingProject ? 'Atualizar Projeto' : 'Salvar Projeto'}
              </Button>
            </form>
          </div>
        )}

        {/* Seção de estatísticas */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Projetos e Estatísticas</h2>
          
          {isLoading ? (
            <p className="text-center">Carregando estatísticas...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Projeto</th>
                    <th className="py-3 px-4 text-left">Apresentador</th>
                    <th className="py-3 px-4 text-center">Total de Votos</th>
                    <th className="py-3 px-4 text-center">Média</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {renderProjectsTable()}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      
      <Toaster position="bottom-center" />
    </main>
  );
} 