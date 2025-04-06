'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import RegisterForm from '@/components/RegisterForm';
import { setCookie } from 'cookies-next';

export default function RegisterPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);

  const registerParticipant = async (data: { name: string; email: string; password: string }) => {
    setIsRegistering(true);
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao registrar participante');
      }

      // Salvar token no localStorage e cookie
      const participantToken = result.token;
      localStorage.setItem('voteToken', participantToken);
      setCookie('voteToken', participantToken, { maxAge: 60 * 60 * 24 * 7 }); // Cookie válido por 7 dias
      
      toast.success('Registro realizado com sucesso!');
      
      // Redirecionar para a página inicial
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar participante');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Sistema de Votação</h1>
          <p className="text-xl text-gray-600 mb-6">
            Crie sua conta para participar
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar para login
          </Link>
        </header>
        
        <div className="max-w-md mx-auto">
          <RegisterForm onSubmit={registerParticipant} isLoading={isRegistering} />
        </div>
      </div>
      
      <Toaster position="bottom-center" />
    </main>
  );
} 