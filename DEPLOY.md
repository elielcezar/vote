# Guia de Deploy no Ubuntu Server

Este guia descreve como implantar o sistema de votação em um servidor Ubuntu.

## Pré-requisitos

- Servidor Ubuntu 22.04 LTS ou superior
- Usuário com privilégios sudo
- Domínio configurado para apontar para o servidor (opcional)

## 1. Instalar as dependências

```bash
# Atualizar os pacotes
sudo apt update
sudo apt upgrade -y

# Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar a instalação
node -v
npm -v

# Instalar PM2 para gerenciar o processo Node
sudo npm install -g pm2
```

## 2. Instalar e configurar o MySQL

```bash
# Instalar MySQL
sudo apt install -y mysql-server

# Configurar segurança do MySQL
sudo mysql_secure_installation

# Acessar o MySQL
sudo mysql -u root -p

# Dentro do MySQL, criar banco e usuário
CREATE DATABASE voting_system;
CREATE USER 'voting_user'@'localhost' IDENTIFIED BY 'SuaSenhaAqui';
GRANT ALL PRIVILEGES ON voting_system.* TO 'voting_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Clonar e configurar o projeto

```bash
# Clonar o repositório
git clone [URL_DO_REPOSITORIO] /var/www/voting-app
cd /var/www/voting-app

# Instalar dependências
npm install

# Criar o arquivo .env
cat > .env << EOF
DATABASE_URL="mysql://voting_user:SuaSenhaAqui@localhost:3306/voting_system"
EOF

# Executar migrações do Prisma
npx prisma db push

# Construir o projeto
npm run build
```

## 4. Configurar PM2 para rodar a aplicação

```bash
# Iniciar a aplicação com PM2
pm2 start npm --name "voting-app" -- start

# Configurar PM2 para iniciar na inicialização do servidor
pm2 startup
pm2 save
```

## 5. Configurar Nginx como proxy reverso

```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar o site
sudo nano /etc/nginx/sites-available/voting-app

# Adicione a seguinte configuração
# server {
#     listen 80;
#     server_name seu-dominio.com www.seu-dominio.com;
#
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# Ativar o site
sudo ln -s /etc/nginx/sites-available/voting-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar o firewall
sudo ufw allow 'Nginx Full'
```

## 6. Configurar HTTPS com Certbot (opcional, mas recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# O Certbot vai atualizar automaticamente a configuração do Nginx
```

## 7. Atualizações futuras

```bash
# Para atualizar o aplicativo, basta executar
cd /var/www/voting-app
git pull
npm install
npx prisma db push
npm run build
pm2 restart voting-app
```

## Verificação

Acesse seu domínio pelo navegador para verificar se a aplicação está funcionando corretamente. 