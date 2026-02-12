# Nginx — Configuración de dominios (lervi.io)

## Arquitectura

```
                         ┌──────────────────────────────┐
Internet ───────────────→│           Nginx               │
                         │                               │
                         │  api.lervi.io                  │──→ Django :8100  (backend)
                         │  admin.lervi.io                │──→ SPA estático  (front-admin)
                         │  lervi.io / www.lervi.io       │──→ SPA estático  (front-web)
                         │  *.lervi.io (wildcard)         │──→ SPA estático  (front-pagina)
                         │  custom domains                │──→ SPA estático  (front-pagina)
                         └──────────────────────────────┘
```

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
# y Custom domains (via CNAME en Cloudflare)
#
# Ambos sirven el mismo SPA. El SPA lee el Host
# del navegador para resolver que hotel mostrar.
# ============================================
server {
    listen 80 default_server;
    server_name *.lervi.io;

    root /srv/lervi/front-pagina/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> **Nota**: El bloque `default_server` captura tanto subdominios (`hotel-arena.lervi.io`)
> como custom domains (`www.hotelarena.com` via CNAME). Cualquier request que no matchee
> los server blocks anteriores cae aqui.
>
> Sin bloques SSL. Certbot los agrega automaticamente al ejecutar
> `sudo certbot --nginx -d lervi.io -d *.lervi.io -d api.lervi.io -d admin.lervi.io`

## Como funciona la resolucion del hotel

1. Huésped visita `hotel-arena.lervi.io` o `www.hotelarena.com` (CNAME → lervi.io)
2. Nginx sirve el mismo SPA (`front-pagina/dist/`)
3. El SPA lee `window.location.hostname` en el navegador
4. Extrae el slug del subdominio, o llama a la API para resolver el custom domain
5. Llama a `GET /api/v1/public/{slug}/info` para cargar datos del hotel

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

### Front-pagina (.env)
```
VITE_API_URL=https://api.lervi.io/api/v1/public
VITE_PLATFORM_DOMAIN=lervi.io
```

### Front-admin (.env)
```
VITE_API_URL=https://api.lervi.io/api/v1
```

### Front-web (.env)
```
VITE_API_URL=https://api.lervi.io/api/v1
```
