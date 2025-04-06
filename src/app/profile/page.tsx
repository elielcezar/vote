'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import Button from '@/components/Button';
import { getCookie, deleteCookie } from 'cookies-next';

// Definição da interface Participant para uso no estado
/*interface Participant {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}*/

// Tipo para os dados de atualização
interface UpdateProfileData {
  name: string;
  email: string;
  //currentPassword?: string;
  newPassword?: string;
  token: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    //currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    //currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Carregar informações do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('voteToken') || getCookie('voteToken')?.toString();
      
      if (!token) {
        router.push('/');
        return;
      }
      
      try {
        const response = await fetch('/api/participants/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.valid) {
          throw new Error(result.error || 'Falha ao carregar perfil');
        }
        
        setFormData({
          ...formData,
          name: result.participant.name,
          email: result.participant.email
        });
      } catch (error) {
        toast.error('Erro ao carregar perfil. Tente novamente.');
        console.error(error);
        
        // Redirecionar para a página inicial após um breve atraso
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);

  // Lidar com alterações no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validar dados do formulário
  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      email?: string; 
      //currentPassword?: string; 
      newPassword?: string; 
      confirmPassword?: string; 
    } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validação de senha apenas se o usuário estiver tentando alterá-la
    if (formData.newPassword || formData.confirmPassword) {
      //if (!formData.currentPassword) {
      //  newErrors.currentPassword = 'Senha atual é obrigatória para alterar a senha';
      //}
      
      if (formData.newPassword.length > 0 && formData.newPassword.length < 6) {
        newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Preparar dados para envio
      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
        token: localStorage.getItem('voteToken') || getCookie('voteToken')?.toString() || ''
      };
      
      // Incluir senhas apenas se estiver alterando
      if (formData.newPassword) {
        //updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Verificar token
      if (!updateData.token) {
        throw new Error('Token não encontrado');
      }
      
      // Atualizar o perfil na API
      const response = await fetch('/api/participants/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar perfil');
      }
      
      toast.success('Perfil atualizado com sucesso!');
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        //currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Meu Perfil</h1>
          <p className="text-xl text-gray-600 mb-6">
            Edite suas informações pessoais
          </p>
          <div className="flex gap-4 justify-center">            
            <Link href="/vote" className="text-green-600 hover:underline">
              Ir para votação
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem('voteToken');
                deleteCookie('voteToken');
                setFormData({
                  name: '',
                  email: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                toast.success('Sessão encerrada com sucesso');
                setTimeout(() => {
                  router.push('/');
                }, 1500);
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* Informações básicas */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSaving}
              />
              {errors.name && (
                <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSaving}
              />
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            
            <hr className="my-6 border-gray-200" />
            
            {/* Alterar senha */}
            <h3 className="text-lg font-semibold mb-4">Alterar senha</h3>
            <p className="text-sm text-gray-500 mb-4">
              Deixe em branco se não quiser alterar sua senha
            </p>            
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                Nova senha
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSaving}
              />
              {errors.newPassword && (
                <p className="mt-1 text-red-500 text-sm">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSaving}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
            
            <Button
              type="submit"
              fullWidth
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </div>
      </div>
      
      <Toaster position="bottom-center" />
    </main>
  );
} 