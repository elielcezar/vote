/**
* 
// concede privilegios de administrador a um participante 
*
**/

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import Button from '@/components/Button';

export default function PromotePage() {
  const [email, setEmail] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/participants/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, adminToken }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao promover participante');
      }
      
      setSuccess(result.message);
      toast.success(result.message);
      
      // Limpar formulário
      setEmail('');
      setAdminToken('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao promover participante');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Promover a Administrador</h1>
          <p className="text-xl text-gray-600 mb-6">
            Conceda privilégios de administrador a um participante
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar para página inicial
          </Link>
        </header>

        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email do Participante
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@exemplo.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="adminToken" className="block text-gray-700 font-medium mb-2">
                Token de Administrador
              </label>
              <input
                id="adminToken"
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Token secreto"
                required
                disabled={isLoading}
              />              
            </div>
            
            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Promover a Administrador'}
            </Button>
            
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
                {success}
              </div>
            )}
          </form>
        </div>
      </div>
      
      <Toaster position="bottom-center" />
    </main>
  );
} 