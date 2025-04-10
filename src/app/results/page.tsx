'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';

interface ProjectStat {
  id: number;
  title: string;
  presenter: string;
  totalVotes: number;
  averageScore: number;
}

export default function ResultsPage() {
  const [projectStats, setProjectStats] = useState<ProjectStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/votes');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar resultados');
      }
      
      const data = await response.json();
      
      // Ordenar por média (maior para menor)
      const sortedData = [...data].sort((a, b) => b.averageScore - a.averageScore);
      setProjectStats(sortedData);
    } catch (error) {
      toast.error('Não foi possível carregar os resultados');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionClass = (index: number) => {
    if (index === 0) return 'bg-yellow-100 border-yellow-400'; // 1º lugar
    if (index === 1) return 'bg-gray-100 border-gray-400'; // 2º lugar
    if (index === 2) return 'bg-orange-100 border-orange-400'; // 3º lugar
    return 'bg-white border-gray-200';
  };

  const getPositionBadge = (index: number) => {
    if (index === 0) return '🥇 1º lugar';
    if (index === 1) return '🥈 2º lugar';
    if (index === 2) return '🥉 3º lugar';
    return `${index + 1}º lugar`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Resultados da Votação</h1>
          <p className="text-xl text-gray-600 mb-4">
            Conheça os projetos mais bem avaliados
          </p>
          <Link href="/admin" className="text-blue-600 hover:underline p-5">Painel Administrativo</Link>
          <Link href="/vote" className="text-blue-600 hover:underline p-5">Votação</Link>
          <Link href="/profile" className="text-purple-600 hover:underline p-5">Editar meu perfil</Link>
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
        </header>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg">Carregando resultados...</p>
          </div>
        ) : (
          <>
            {projectStats.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-lg">Ainda não há votos registrados.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {projectStats.map((project, index) => (
                  <div 
                    key={project.id} 
                    className={`border-2 rounded-lg p-6 shadow-md transition-transform hover:transform hover:scale-[1.01] ${getPositionClass(index)}`}
                  >
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-2">
                          {getPositionBadge(index)}
                        </span>
                        <h2 className="text-2xl font-bold mb-1">{project.title}</h2>
                        <p className="text-gray-600 mb-4">Apresentado por {project.presenter}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-blue-600">
                          {project.averageScore.toFixed(1)}
                        </div>
                        <p className="text-sm text-gray-500">
                          de {project.totalVotes} {project.totalVotes === 1 ? 'voto' : 'votos'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      <Toaster position="bottom-center" />
    </main>
  );
} 