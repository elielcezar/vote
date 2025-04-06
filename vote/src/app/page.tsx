'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import { Toaster, toast } from 'react-hot-toast';
import { setCookie, deleteCookie } from 'cookies-next';

interface Participant {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loginParticipant = async (data: { email: string; password: string }) => {
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer login');
      }

      // Salvar token no localStorage e cookie
      const participantToken = result.participant.token;
      localStorage.setItem('voteToken', participantToken);
      setCookie('voteToken', participantToken, { maxAge: 60 * 60 * 24 * 7 }); // Cookie válido por 7 dias
      
      // Definir participante no estado
      setToken(participantToken);
      setParticipant(result.participant);
      
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch('/api/participants/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToValidate }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        throw new Error(result.error || 'Token inválido');
      }

      setParticipant(result.participant);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao validar token');
      return false;
    }
  };

  // Verificar token no localStorage ao carregar a página
  useEffect(() => {
    const storedToken = localStorage.getItem('voteToken');
    
    if (storedToken) {
      setToken(storedToken);
      setCookie('voteToken', storedToken, { maxAge: 60 * 60 * 24 * 7 }); // Atualizar cookie
      validateToken(storedToken);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Sistema de Votação</h1>
          <p className="text-xl text-gray-600 mb-6">
            Avalie os projetos apresentados no evento
          </p>          
        </header>

        {!token || !participant ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
              <h2 className="text-2xl font-bold mb-4 text-center">Acesse o sistema</h2>
              <p className="text-center text-gray-600 mb-8">
                Faça login para votar nos projetos ou {' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                  registre-se
                </Link>
                {' '} se ainda não tem uma conta.
              </p>
              
              <LoginForm onSubmit={loginParticipant} isLoading={isLoggingIn} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo, {participant.name}!</h2>
            <p className="mt-2 mb-8 text-gray-600">Agora você pode votar nos projetos apresentados.</p>
            
            {participant.role === 'admin' && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-semibold">Você tem acesso de administrador</p>
                <div className="flex gap-2 mt-2 justify-center">
                  <Link 
                    href="/admin" 
                    className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-3 rounded"
                  >
                    Painel Admin
                  </Link>
                  <Link 
                    href="/results" 
                    className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-3 rounded"
                  >
                    Resultados
                  </Link>
                  <Link 
                    href="/promote" 
                    className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-3 rounded"
                  >
                    Promover Admin
                  </Link>
                </div>
              </div>
            )}
            
            <Link 
              href="/vote" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center mb-4"
            >
              Ir para Votação
            </Link>
            
            <button 
              onClick={() => {
                localStorage.removeItem('voteToken');
                deleteCookie('voteToken');
                setToken(null);
                setParticipant(null);
                toast.success('Sessão encerrada com sucesso');
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Sair
            </button>
          </div>
        )}
      </div>

      <Toaster position="bottom-center" />
    </main>
  );
}
