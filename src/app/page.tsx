'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import { Toaster, toast } from 'react-hot-toast';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

interface Participant {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState<string | null>(null);
  // eslint-disable-next-line no-unused-vars
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('voteToken', participantToken);
      }
      setCookie('voteToken', participantToken, { maxAge: 60 * 60 * 24 * 7 }); // Cookie válido por 7 dias
      
      // Definir participante no estado
      setToken(participantToken);
      setParticipant(result.participant);
      
      toast.success('Login realizado com sucesso!');

      if (result.participant.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/vote');
      }

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
    // Garantir que o código só execute no navegador
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('voteToken');
      
      if (storedToken) {
        setToken(storedToken);
        setCookie('voteToken', storedToken, { maxAge: 60 * 60 * 24 * 7 }); // Atualizar cookie
        validateToken(storedToken);
      }
    }
  }, []);

  return (
    <div className="wrapper flex flex-col md:flex-row h-screen outline bg-gradient-to-b bg-slate-50">

      <aside className="md:h-screen md:sticky top-0 md:w-6/12">
        <header className="md:h-screen flex flex-col justify-center p-5 text-center items-center min-h-50 md:text-left md:items-start px-15">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Sistema de votação</h1>

          <p className="text-gray-600 m-0">
              {token ? (
                <span>Você está logado como {participant?.name || 'usuário'}.</span>
              ) : (
                <span>
                  Faça login para votar nos projetos ou {' '}
                  <Link href="/register" className="text-blue-600 hover:underline">
                    registre-se
                  </Link>
                  {' '} se ainda não tem uma conta.
                </span>
              )}
          </p>     
          
          
        </header>        
      </aside>
            
      <main 
        className="md:min-h-screen md:bg-gradient-to-b from-gray-100 to-white md:py-12 flex items-center md:w-6/12 bg-cover bg-center"
        style={{ backgroundImage: 'url(/background.jpg)' }}
      >

        <div className="container mx-auto px-4"> 
        <LoginForm onSubmit={loginParticipant} isLoading={isLoggingIn} />                         

          
        </div>

        <Toaster position="bottom-center" />
      </main>

    </div>    
  );
}
