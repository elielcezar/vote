import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar o token do usuário
 * 
 * Este hook gerencia o token do usuário armazenado em localStorage
 * e fornece métodos para definir, obter e limpar o token.
 */
export function useUserToken() {
  const [token, setTokenState] = useState<string | null>(null);

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem('user_token');
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  // Função para definir o token
  const setToken = (newToken: string) => {
    localStorage.setItem('user_token', newToken);
    setTokenState(newToken);
  };

  // Função para limpar o token
  const clearToken = () => {
    localStorage.removeItem('user_token');
    setTokenState(null);
  };

  return {
    token,
    setToken,
    clearToken,
    isAuthenticated: !!token
  };
}