   server {
       server_name vote.ecwd.pro;
       
       root /var/www/vote.ecwd.pro;
       index index.html;
       
       location / {
           proxy_pass http://localhost:3001;  # Ou a porta que você está usando
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Configuração SSL
       listen 443 ssl;
       ssl_certificate /etc/letsencrypt/live/vote.ecwd.pro/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/vote.ecwd.pro/privkey.pem;
       include /etc/letsencrypt/options-ssl-nginx.conf;
       ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
   }
   
   server {
       listen 80;
       server_name vote.ecwd.pro;
       return 301 https://$host$request_uri;
   }