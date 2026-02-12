# Nginx — Configuración de dominios (lervi.io)

## Arquitectura

```
                         ┌──────────────────────────────┐
Internet ───────────────→│           Nginx               │
                         │                               │
                         │  api.lervi.io                  │──→ Django :8100  (backend)
                         │  admin.lervi.io                │──→ SPA estático  (front-admin)
                         │  lervi.io / www.lervi.io       │──→ SPA estático  (front-web)
                         │  *.lervi.io (wildcard)         │──→ Node.js :3100 (front-pagina)
                         │  custom domains                │──→ Node.js :3100 (front-pagina)
                         └──────────────────────────────┘
```

> **front-pagina es Next.js 14 con SSR**. Necesita un proceso Node.js corriendo.
> No se puede servir como archivos estáticos.

## Nginx Config

### `/etc/nginx/sites-available/lervi.io`

```nginx
# ============================================
# API Backend (api.lervi.io)
# ============================================
server {
    listen 80;
    server_name api.lervi.io;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /srv/lervi/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /srv/lervi/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# ============================================
# Admin Panel (admin.lervi.io)
# ============================================
server {
    listen 80;
    server_name admin.lervi.io;

    root /srv/lervi/front-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# ============================================
# Web corporativa (lervi.io / www.lervi.io)
# ============================================
server {
    listen 80;
    server_name lervi.io www.lervi.io;

    root /srv/lervi/front-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# ============================================
# Hotel Websites — Wildcard subdomains (*.lervi.io)
# y Custom domains (via CNAME)
#
# Next.js 14 SSR — proxy al proceso Node.js
# El middleware de Next.js resuelve el hotel por Host header
# ============================================
server {
    listen 80 default_server;
    server_name *.lervi.io;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

> **Nota**: El bloque `default_server` captura tanto subdominios (`demo.lervi.io`)
> como custom domains (`www.hotelarena.com` via CNAME). Cualquier request que no matchee
> los server blocks anteriores cae aqui.
>
> Sin bloques SSL. Certbot los agrega automaticamente al ejecutar
> `sudo certbot --nginx -d lervi.io -d *.lervi.io -d api.lervi.io -d admin.lervi.io`

## Como funciona la resolucion del hotel

1. Huesped visita `demo.lervi.io` o `www.hotelarena.com` (CNAME → lervi.io)
2. Nginx proxea al proceso Node.js (Next.js) en puerto 3000
3. El middleware de Next.js lee el header `Host`
4. Extrae el slug del subdominio, o llama a la API interna para resolver el custom domain
5. Reescribe internamente: `/` → `/{slug}/` para cargar los datos del hotel

## Deploy de front-pagina (Next.js)

### Build

```bash
cd /srv/lervi/front-pagina
npm ci
npm run build

# Standalone output: copiar archivos estaticos
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true
```

### Proceso Node.js con Supervisor

```ini
# /etc/supervisor/conf.d/lervi-pagina.conf
[program:lervi-pagina]
command=/usr/bin/node .next/standalone/server.js
directory=/srv/lervi/front-pagina
environment=PORT="3100",NODE_ENV="production"
user=www-data
autostart=true
autorestart=true
startsecs=5
stopwaitsecs=10
stdout_logfile=/var/log/supervisor/lervi-pagina.log
stderr_logfile=/var/log/supervisor/lervi-pagina-error.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start lervi-pagina
```

## Orden de matching en Nginx

1. Nombre exacto (`api.lervi.io`, `admin.lervi.io`, `lervi.io`, `www.lervi.io`)
2. `default_server` — todo lo demas (subdominios de hoteles + custom domains)

## Activar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/lervi.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Variables de entorno (produccion)

### Backend (.env)
```
ALLOWED_HOSTS=api.lervi.io,admin.lervi.io,lervi.io
CORS_ALLOWED_ORIGINS=https://admin.lervi.io,https://lervi.io,https://www.lervi.io
```

### Front-pagina (.env.production)
```
INTERNAL_API_URL=http://127.0.0.1:8100/api/v1/public
INTERNAL_MEDIA_URL=http://127.0.0.1:8100/media
NEXT_PUBLIC_API_URL=/api
PLATFORM_DOMAIN=lervi.io
PORT=3100
```

### Front-admin (.env)
```
VITE_API_URL=https://api.lervi.io/api/v1
```

### Front-web (.env)
```
VITE_API_URL=https://api.lervi.io/api/v1
```
