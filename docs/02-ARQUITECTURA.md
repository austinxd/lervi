# Lervi — Arquitectura del Sistema

## 1. Visión general

Lervi se compone de cuatro componentes principales que se comunican a través de una API central. Toda la lógica de negocio reside en el backend. Los frontends son capas de presentación sin lógica propia.

```
┌─────────────────────────────────────────────────────────┐
│                      INTERNET                           │
└──────┬──────────┬──────────────┬───────────────┬────────┘
       │          │              │               │
       ▼          ▼              ▼               ▼
┌────────────┐ ┌───────────┐ ┌────────────┐ ┌──────────────┐
│  Website   │ │   Admin   │ │  Admin     │ │  Super Admin │
│  Hotel     │ │   Panel   │ │  Móvil     │ │  (interno)   │
│  (SSR)     │ │   (SPA)   │ │  (App)     │ │  (SPA)       │
└─────┬──────┘ └─────┬─────┘ └─────┬──────┘ └──────┬───────┘
      │              │             │                │
      └──────────────┴──────┬──────┴────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │                     │
                 │   LERVI API     │
                 │   (Backend)         │
                 │                     │
                 │  ┌───────────────┐  │
                 │  │ Motor de      │  │
                 │  │ Reservas      │  │
                 │  ├───────────────┤  │
                 │  │ Motor de      │  │
                 │  │ Precios       │  │
                 │  ├───────────────┤  │
                 │  │ Motor de      │  │
                 │  │ Automatización│  │
                 │  ├───────────────┤  │
                 │  │ Gestión de    │  │
                 │  │ Tenants       │  │
                 │  └───────────────┘  │
                 │                     │
                 └──────────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │PostgreSQL│ │  Redis   │ │  Cola de  │
        │          │ │  (cache, │ │  tareas   │
        │          │ │  sesiones│ │  (async)  │
        │          │ │  tiempo  │ │           │
        │          │ │  real)   │ │           │
        └──────────┘ └──────────┘ └──────────┘
```

---

## 2. Componentes

### 2.1 Lervi API (Backend)

Monolito modular. Un solo servicio desplegable que contiene toda la lógica de negocio, organizada internamente en módulos con boundaries claros.

Responsabilidades:
- Autenticación y autorización (JWT + roles)
- Aislamiento multi-tenant (toda query filtrada por organización)
- CRUD de todas las entidades del dominio
- Máquinas de estado (reservas, habitaciones, pagos)
- Motor de precios (cálculo de tarifas)
- Motor de automatizaciones (procesamiento de reglas event-driven)
- API pública para websites de hoteles (disponibilidad, reservas)
- API privada para panel admin (gestión completa)
- API interna para super admin (gestión de organizaciones)
- Procesamiento asíncrono (notificaciones, webhooks, tareas programadas)

Por qué monolito modular y no microservicios:
- El dominio es cohesivo — reservas, habitaciones y precios están íntimamente relacionados
- Menos complejidad operativa para escalar de 1 a 100 hoteles
- Transacciones atómicas sin coordinación distribuida
- Un solo deploy, un solo log, un solo debug
- Si algún módulo necesita escalar independientemente en el futuro, se puede extraer

### 2.2 Website del Hotel (SSR)

Aplicación server-side rendered que sirve el website público de cada hotel. Resuelve el tenant por dominio/subdominio, obtiene configuración y contenido del backend, y renderiza HTML con el branding del hotel.

Responsabilidades:
- Resolución de tenant por dominio
- Renderizado server-side para SEO
- Presentación del branding del hotel (colores, logo, fuentes)
- Presentación de contenido (páginas, habitaciones, fotos)
- Buscador de disponibilidad (consume API del backend)
- Flujo de reserva (consume API del backend)
- Consulta de reserva por código

No tiene lógica de negocio. Si el backend está caído, el website no puede crear reservas.

### 2.3 Admin Panel (SPA)

Aplicación single-page para la gestión interna del hotel. Usada por owner, manager, recepción, housekeeping y mantenimiento.

Responsabilidades:
- Dashboard operativo (ocupación, reservas del día, tareas pendientes)
- Gestión de reservas (crear, modificar, check-in, check-out)
- Gestión de habitaciones (estado, configuración de camas)
- Gestión de huéspedes (registro, historial)
- Gestión de tareas (asignación, seguimiento)
- Configuración del hotel (precios, políticas, website, automatizaciones)
- Gestión de usuarios y roles
- Reportes

La interfaz se adapta según el rol del usuario. Housekeeping solo ve sus tareas. Recepción ve reservas y check-in. Owner ve todo.

### 2.4 Admin Móvil (App nativa)

Versión móvil del admin panel, optimizada para uso en movimiento. Prioridad en los flujos que se usan fuera del escritorio.

Flujos prioritarios móvil:
- Housekeeping: ver tareas, marcar limpieza, reportar incidencias
- Mantenimiento: ver tareas, marcar completadas, reportar
- Recepción: check-in rápido, consulta de reservas
- Notificaciones push en tiempo real

No es una réplica completa del admin panel. La configuración pesada (pricing, automatizaciones, website) se hace desde el panel web.

### 2.5 Super Admin (SPA interna)

Panel interno de Lervi para gestionar la plataforma. No accesible para los hoteles.

Responsabilidades:
- Crear y gestionar organizaciones
- Gestionar suscripciones y planes
- Monitoreo del sistema (salud, uso, errores)
- Soporte (acceso a configuración de orgs, nunca a datos de huéspedes)

---

## 3. Multi-tenancy

### 3.1 Estrategia: Base de datos compartida con aislamiento por fila

Todos los hoteles comparten la misma base de datos MySQL 8. Cada tabla principal tiene una columna `organization_id` que identifica al tenant. Toda query está filtrada por organización.

Por qué esta estrategia:
- Simple de operar (una sola base de datos)
- Eficiente en recursos para hoteles pequeños/medianos
- Migraciones de schema se aplican una vez, no por tenant
- Consultas cross-tenant para super admin son posibles cuando se necesitan
- MySQL 8 soporta columnas JSON nativas para metadata extensible
- Amplio soporte en proveedores de hosting y equipo con experiencia existente

### 3.2 Resolución de tenant

El tenant se resuelve de forma diferente según el contexto:

| Contexto | Cómo se resuelve | Ejemplo |
|----------|-------------------|---------|
| API admin | Token JWT contiene `organization_id` | Bearer token del usuario autenticado |
| Website hotel | Dominio de la petición → lookup de organización | `hotelmirador.com` → org_id: 42 |
| Super admin | Token JWT con rol super_admin, org_id se pasa como parámetro | Header o query param |

### 3.3 Aislamiento

- **Nivel aplicación**: Middleware que extrae `organization_id` y lo inyecta en el contexto de cada request. Todos los querysets filtran por este ID.
- **Nivel base de datos**: Índices compuestos con `organization_id` como primera columna en todas las tablas principales. Views filtradas por tenant para queries de reportes.
- **Nivel API**: Los endpoints nunca exponen datos de otras organizaciones. Los IDs de entidades no son secuenciales (UUIDs) para evitar enumeración.

### 3.4 Lo que NO se comparte entre organizaciones

Todo. Específicamente:
- Huéspedes
- Reservas
- Habitaciones y tipos
- Tarifas y promociones
- Tareas
- Usuarios (un usuario pertenece a una organización)
- Configuración de website
- Reglas de automatización
- Pagos

### 3.5 Lo que SÍ es global (gestionado por super admin)

- Catálogo de amenidades estándar (el hotel elige cuáles aplican)
- Tipos de origen de reserva del core (website, walk_in, phone)
- Templates de reglas de automatización predefinidas
- Catálogo de integraciones de pago disponibles
- Planes de suscripción

---

## 4. Modelo de datos

### 4.1 Diagrama de entidades

```
Organization (tenant raíz)
├── Property (1:N)
│   ├── RoomType (1:N)
│   │   ├── RoomTypePhoto (1:N)
│   │   ├── RoomTypeBedConfig (1:N)  ← configs de cama permitidas
│   │   └── RoomTypeAmenity (M:N)
│   ├── Room (1:N)
│   │   └── room_type_id → RoomType
│   │   └── active_bed_config → BedConfig
│   ├── RatePlan (1:N)
│   │   └── room_type_id → RoomType
│   ├── Season (1:N)
│   └── PropertyPhoto (1:N)
│
├── Guest (1:N)
│
├── Reservation (1:N)
│   ├── property_id → Property
│   ├── guest_id → Guest
│   ├── room_type_id → RoomType
│   ├── room_id → Room (nullable, asignada después)
│   ├── requested_bed_config → BedConfig
│   ├── ReservationOrigin (1:1 embebido o tabla separada)
│   └── Payment (1:N)
│
├── Task (1:N)
│   ├── property_id → Property
│   ├── room_id → Room (nullable)
│   └── assigned_to → User (nullable)
│
├── User (1:N)
│   └── role (owner | manager | reception | housekeeping | maintenance)
│
├── AutomationRule (1:N)
│
└── WebsiteConfig (1:1)
    ├── Branding (colores, logo, fuentes)
    ├── Domain (dominio propio o subdominio)
    ├── WebsitePage (1:N)  ← páginas editables
    └── SEOConfig
```

### 4.2 Identificadores

- Todas las entidades usan UUID v4 como identificador primario.
- No se usan IDs secuenciales en endpoints públicos para evitar enumeración.
- La combinación `organization_id` + `id` es única a nivel global.

### 4.3 Auditoría

Toda entidad principal registra:
- `created_at` — timestamp de creación
- `updated_at` — timestamp de última modificación
- `created_by` — usuario que creó el registro (nullable para acciones del sistema)

Las transiciones de estado (reservas, habitaciones, tareas) se registran en una tabla de log:
- `entity_type` + `entity_id` — qué entidad cambió
- `field` — qué campo cambió (ej: `operational_status`)
- `old_value` → `new_value`
- `changed_by` — usuario o `system`
- `timestamp`

---

## 5. APIs

### 5.1 API Pública (para websites de hoteles)

Consumida por el website del hotel y potencialmente por integraciones futuras. No requiere autenticación de usuario admin.

Endpoints principales:

```
GET  /public/{property_slug}/availability?check_in=&check_out=&adults=&children=
     → tipos de habitación disponibles con precios calculados

GET  /public/{property_slug}/room-types
     → listado de tipos de habitación con fotos, amenidades, configs de cama

GET  /public/{property_slug}/room-types/{slug}
     → detalle de un tipo de habitación

POST /public/{property_slug}/reservations
     → crear reserva (estado: PENDIENTE)

GET  /public/{property_slug}/reservations/{code}
     → consultar reserva por código público

POST /public/{property_slug}/payments/initiate
     → iniciar proceso de pago con pasarela

POST /public/webhooks/payments/{gateway}
     → webhook de confirmación de pago desde pasarela

GET  /public/{property_slug}/website
     → configuración del website (branding, páginas, SEO)
```

La autenticación del tenant se resuelve por `property_slug` → lookup a organización.

### 5.2 API Privada (para admin panel y app móvil)

Requiere autenticación JWT. El tenant se resuelve del token.

Endpoints principales (agrupados por módulo):

```
Autenticación
  POST /auth/login
  POST /auth/refresh
  POST /auth/logout

Reservas
  GET    /reservations
  GET    /reservations/{id}
  POST   /reservations
  PATCH  /reservations/{id}
  POST   /reservations/{id}/confirm
  POST   /reservations/{id}/check-in
  POST   /reservations/{id}/check-out
  POST   /reservations/{id}/cancel
  POST   /reservations/{id}/no-show

Habitaciones
  GET    /rooms
  GET    /rooms/{id}
  POST   /rooms
  PATCH  /rooms/{id}
  POST   /rooms/{id}/change-status
  POST   /rooms/{id}/change-bed-config

Tipos de habitación
  GET    /room-types
  GET    /room-types/{id}
  POST   /room-types
  PATCH  /room-types/{id}

Huéspedes
  GET    /guests
  GET    /guests/{id}
  POST   /guests
  PATCH  /guests/{id}

Pagos
  GET    /reservations/{id}/payments
  POST   /reservations/{id}/payments
  POST   /payments/{id}/refund

Tareas
  GET    /tasks
  GET    /tasks/{id}
  POST   /tasks
  PATCH  /tasks/{id}
  POST   /tasks/{id}/start
  POST   /tasks/{id}/complete

Usuarios
  GET    /users
  POST   /users
  PATCH  /users/{id}

Automatizaciones
  GET    /automation-rules
  POST   /automation-rules
  PATCH  /automation-rules/{id}
  DELETE /automation-rules/{id}

Configuración website
  GET    /website/config
  PATCH  /website/config
  GET    /website/pages
  POST   /website/pages
  PATCH  /website/pages/{id}

Propiedades
  GET    /properties
  GET    /properties/{id}
  PATCH  /properties/{id}

Pricing
  GET    /rate-plans
  POST   /rate-plans
  PATCH  /rate-plans/{id}
  GET    /seasons
  POST   /seasons
  PATCH  /seasons/{id}

Dashboard
  GET    /dashboard/today          ← resumen del día
  GET    /dashboard/occupancy      ← ocupación actual y proyectada
  GET    /dashboard/revenue        ← ingresos del período
```

Los endpoints aplican control de acceso por rol. Housekeeping solo puede acceder a sus tareas y cambiar estado de habitaciones dentro de las transiciones permitidas.

### 5.3 API Super Admin (interna)

Requiere autenticación JWT con rol `super_admin`. Acceso restringido a la gestión de la plataforma.

```
GET    /admin/organizations
POST   /admin/organizations
PATCH  /admin/organizations/{id}
GET    /admin/organizations/{id}/stats
GET    /admin/system/health
GET    /admin/system/metrics
```

---

## 6. Autenticación y autorización

### 6.1 Autenticación

- JWT con access token (corta duración) + refresh token (larga duración)
- Access token contiene: `user_id`, `organization_id`, `role`, `property_ids` (propiedades a las que tiene acceso)
- El refresh token se usa para obtener nuevos access tokens sin re-login

### 6.2 Roles y permisos

Los roles son predefinidos, no configurables. Cada rol tiene un set fijo de permisos.

| Permiso | Owner | Manager | Recepción | Housekeeping | Mantenimiento |
|---------|:-----:|:-------:|:---------:|:------------:|:-------------:|
| Ver dashboard | ✓ | ✓ | ✓ (limitado) | ✗ | ✗ |
| Gestionar reservas | ✓ | ✓ | ✓ | ✗ | ✗ |
| Check-in / Check-out | ✓ | ✓ | ✓ | ✗ | ✗ |
| Gestionar huéspedes | ✓ | ✓ | ✓ | ✗ | ✗ |
| Registrar pagos | ✓ | ✓ | ✓ | ✗ | ✗ |
| Ver/gestionar tareas propias | ✓ | ✓ | ✓ | ✓ | ✓ |
| Asignar tareas | ✓ | ✓ | ✗ | ✗ | ✗ |
| Inspeccionar habitaciones | ✓ | ✓ | ✓ | ✗ | ✗ |
| Gestionar habitaciones | ✓ | ✓ | ✗ | ✗ | ✗ |
| Gestionar pricing | ✓ | ✗ | ✗ | ✗ | ✗ |
| Gestionar usuarios | ✓ | ✗ | ✗ | ✗ | ✗ |
| Configurar website | ✓ | ✓ | ✗ | ✗ | ✗ |
| Configurar automatizaciones | ✓ | ✓ | ✗ | ✗ | ✗ |
| Ver reportes financieros | ✓ | ✗ | ✗ | ✗ | ✗ |
| Ver reportes operativos | ✓ | ✓ | ✗ | ✗ | ✗ |

### 6.3 Acceso multi-propiedad

Un usuario puede tener acceso a una o varias propiedades de la misma organización. El token JWT incluye `property_ids` y el backend filtra datos según las propiedades asignadas.

---

## 7. Motor de automatizaciones — Arquitectura interna

### 7.1 Flujo de procesamiento

```
Acción en el sistema (ej: check-out)
  → Backend ejecuta la lógica de negocio
  → Backend emite evento al bus de eventos interno
  → Motor de automatizaciones recibe el evento
  → Busca reglas activas de la organización que coincidan con el trigger
  → Para cada regla (ordenada por prioridad):
      → Evalúa condiciones contra los datos del evento
      → Si todas las condiciones se cumplen:
          → Encola las acciones para ejecución asíncrona
  → Worker procesa la cola:
      → Ejecuta cada acción (crear tarea, notificar, webhook, etc.)
      → Registra resultado en log de automatización
```

### 7.2 Ejecución

- Las acciones se ejecutan de forma **asíncrona** mediante una cola de tareas (no bloquean la operación principal).
- Si una acción falla (ej: webhook timeout), se reintenta con backoff exponencial hasta un máximo de intentos.
- Cada ejecución queda registrada con: regla, evento, condiciones evaluadas, acciones ejecutadas, resultado.

### 7.3 Seguridad

- Las reglas solo pueden actuar sobre entidades de su propia organización.
- Las acciones están limitadas al catálogo definido — no se puede ejecutar código arbitrario.
- El rate limit por organización previene bucles infinitos (ej: una regla que crea un evento que dispara la misma regla).

---

## 8. Motor de precios — Arquitectura interna

### 8.1 Pipeline de cálculo

El precio de una noche se calcula pasando por capas en orden:

```
1. Precio base (del tipo de habitación)
   ↓
2. Ajuste por temporada (si la fecha cae en una temporada definida)
   ↓
3. Ajuste por día de semana (markup/discount por día)
   ↓
4. Ajuste por ocupación (si la propiedad supera umbral de ocupación)
   ↓
5. Ajuste por plan tarifario (no-reembolsable, early bird, etc.)
   ↓
6. Ajuste por duración (descuento por estancia de N+ noches)
   ↓
7. Promoción aplicada (si hay código o promoción activa)
   ↓
= Precio final de la noche
```

El precio total de la reserva = suma de precios de cada noche individual. Cada noche puede tener un precio diferente.

### 8.2 Principios

- El frontend nunca calcula precios. Solo muestra lo que el backend retorna.
- El precio se calcula al momento de la consulta de disponibilidad y se recalcula al crear la reserva.
- Una vez la reserva está CONFIRMADA, el precio queda fijado (snapshot). Cambios en tarifas no afectan reservas existentes.
- El hotel configura las capas que quiere usar. Si no define temporadas, esa capa no aplica.

---

## 9. Comunicación en tiempo real

### 9.1 Casos de uso

- Actualización de estado de habitaciones en el panel (housekeeping limpia → recepción ve el cambio)
- Nuevas reservas entrantes
- Nuevas tareas asignadas
- Notificaciones al staff

### 9.2 Mecanismo

WebSocket o Server-Sent Events (SSE) desde el backend al admin panel y app móvil. El backend publica eventos en un canal Redis pub/sub, y los clientes conectados reciben las actualizaciones filtradas por organización y propiedad.

No se usa tiempo real para el website público del hotel. La disponibilidad se consulta on-demand.

---

## 10. Stack tecnológico recomendado

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| Backend API | Python + Django REST Framework | Madurez, ORM potente, admin integrado para super admin, ecosistema amplio |
| Base de datos | MySQL 8 | JSON nativo, InnoDB transaccional, experiencia del equipo, amplio soporte en hosting |
| Cache / Tiempo real | Redis | Pub/sub para websockets, cache de queries frecuentes, sesiones |
| Cola de tareas | Celery + Redis | Procesamiento asíncrono de automatizaciones, notificaciones, webhooks |
| Website hotel | Next.js (React) | SSR nativo para SEO, React para interactividad del motor de reservas |
| Admin panel | React + TypeScript | SPA rica, componentes reutilizables, ecosistema maduro |
| Admin móvil | React Native (Expo) | Código compartido con el ecosistema React, notificaciones push |
| Super admin | React + TypeScript | Mismo stack que admin panel, desarrollo eficiente |
| Almacenamiento archivos | S3-compatible | Fotos de habitaciones, logos, documentos |
| Pasarelas de pago | Stripe / MercadoPago / OpenPay | Adaptadores intercambiables, el core define la interfaz |

### 10.1 Por qué Django y no otro framework

- ORM maduro con soporte nativo para multi-tenancy (managers custom, querysets filtrados)
- Sistema de migraciones robusto
- Django Admin reutilizable para el super admin con mínimo esfuerzo
- Ecosistema de paquetes (django-filter, drf-spectacular para OpenAPI, django-cors-headers)
- Celery integra naturalmente para tareas asíncronas
- El equipo (tú) ya tiene experiencia con Django

### 10.2 Por qué Next.js para los websites

- Server-side rendering obligatorio para SEO (los hoteles necesitan posicionar en Google)
- Dynamic routing por dominio (middleware de Next.js resuelve el tenant)
- React para el flujo de reservas (interactivo, sin recargar página)
- Optimización de imágenes built-in (fotos de habitaciones)

---

## 11. Deployment

### 11.1 Infraestructura mínima (inicio)

```
┌──────────────────────────────────────┐
│           Servidor / VPS             │
│                                      │
│  ┌────────────┐  ┌────────────────┐  │
│  │ Backend    │  │ Website        │  │
│  │ (Django)   │  │ (Next.js)      │  │
│  │ :8000      │  │ :3000          │  │
│  └─────┬──────┘  └───────┬────────┘  │
│        │                 │           │
│  ┌─────┴─────────────────┴────────┐  │
│  │         Nginx (reverse proxy)  │  │
│  │         :80 / :443             │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │PostgreSQL│  │  Redis   │         │
│  │ :5432    │  │  :6379   │         │
│  └──────────┘  └──────────┘         │
│                                      │
│  ┌──────────────────────┐           │
│  │ Celery Worker        │           │
│  │ (automatizaciones,   │           │
│  │  notificaciones)     │           │
│  └──────────────────────┘           │
└──────────────────────────────────────┘
```

### 11.2 Escalamiento futuro

Cuando el número de hoteles crezca:
- PostgreSQL: read replicas para queries de reportes
- Backend: múltiples instancias detrás de load balancer
- Celery: workers dedicados por tipo de tarea
- Redis: cluster para pub/sub a escala
- Archivos: CDN para fotos y assets estáticos
- Website: Edge deployment (Vercel o similar) con middleware de resolución de tenant

### 11.3 Dominios

```
api.lervi.com              → Backend API
admin.lervi.com            → Admin Panel SPA
app.lervi.com              → Admin Móvil (deep links)
superadmin.lervi.com       → Super Admin (acceso restringido)

{hotel}.lervi.com          → Website del hotel (subdominio)
hotelmirador.com              → Website del hotel (dominio propio, CNAME + SSL)
```

Nginx o el load balancer resuelve a qué servicio enviar cada request según el dominio.
