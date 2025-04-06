# Sistema de Votação para Eventos

Um sistema completo de votação para eventos onde participantes podem avaliar projetos apresentados.

## Funcionalidades

- Registro de participantes com geração de token único
- Avaliação de projetos com notas de 1 a 10 e comentários opcionais
- Painel administrativo para gerenciar projetos
- Página de resultados em tempo real
- Interface responsiva e amigável

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MySQL
- Prisma ORM

## Configuração do Banco de Dados

1. Crie um banco de dados MySQL
2. Configure as credenciais no arquivo `.env`:

```
DATABASE_URL="mysql://usuario:senha@servidor:porta/nome_banco"
```

3. Execute as migrações do Prisma:

```bash
npx prisma db push
```

## Instalação

```bash
# Clonar o repositório
git clone [URL_DO_REPOSITORIO]
cd vote

# Instalar dependências
npm install

# Configurar o banco de dados (criar arquivo .env)
# DATABASE_URL="mysql://usuario:senha@servidor:porta/nome_banco"

# Executar migrações do banco de dados
npx prisma db push

# Executar em desenvolvimento
npm run dev
```

## Deploy em Produção

```bash
# Compilar para produção (gitpull/install/build/restart via package.json)
npm run deploy
```

## Estrutura do Projeto

- `/src/app/` - Páginas e rotas da aplicação
- `/src/app/api/` - Endpoints da API REST
- `/src/components/` - Componentes reutilizáveis
- `/src/lib/` - Utilidades e configurações
- `/prisma/` - Schema e configuração do banco de dados

## Páginas Principais

- `/` - Página inicial e registro de participantes
- `/vote` - Página para participantes votarem
- `/results` - Página pública de resultados
- `/admin` - Painel administrativo

## Licença

Este projeto está licenciado sob a licença MIT.
