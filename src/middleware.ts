import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação como administrador
const PROTECTED_ROUTES = ['/admin', '/results'];

export async function middleware(request: NextRequest) {
  // Obter token do cookie
  const token = request.cookies.get('voteToken')?.value;
  
  // Se o caminho da solicitação não é uma rota protegida, continue
  if (!PROTECTED_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Se não houver token, redirecione para a página inicial
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  try {
    // Verificar o papel do usuário no servidor
    const response = await fetch(`${request.nextUrl.origin}/api/participants/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    
    // Se o token for válido e o usuário for administrador, continue
    if (data.valid && data.participant.role === 'admin') {
      return NextResponse.next();
    }
    
    // Caso contrário, redirecione para a página inicial
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    // Em caso de erro, redirecione para a página inicial
    console.error('Erro ao validar token de administrador:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Configurar os caminhos para os quais o middleware deve ser executado
export const config = {
  matcher: ['/admin/:path*', '/results/:path*'],
}; 