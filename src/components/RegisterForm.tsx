import React, { useState } from 'react';
import Button from './Button';

interface RegisterFormProps {
  onSubmit: (data: { name: string; email: string; password: string }) => Promise<void>;
  isLoading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      await onSubmit({ name, email, password });
      // Reset form on success
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Registrar para Votar</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 border rounded-lg ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Seu nome completo"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-2 border rounded-lg ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:ring-blue-500 focus:border-blue-500`}
            placeholder="seu.email@exemplo.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 border rounded-lg ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Sua senha"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-red-500 text-sm">{errors.password}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirmar Senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full p-2 border rounded-lg ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Confirme sua senha"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>
        
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrar'}
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm; 