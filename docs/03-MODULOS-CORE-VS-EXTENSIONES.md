# Lervi — Módulos Core vs Extensiones

## 1. Criterio de clasificación

Un módulo es **core** si cumple al menos una de estas condiciones:
- Sin él, el hotel no puede operar (no puede recibir huéspedes, cobrar, o mantener habitaciones)
- Otros módulos core dependen de él
- Eliminar su funcionalidad rompe un flujo operativo fundamental

Un módulo es **extensión** si:
- El hotel puede operar sin él
- Agrega valor pero no es requisito para el funcionamiento base
- Puede activarse/desactivarse por organización sin afectar el core
- Ningún módulo core depende de él

---

## 2. Módulos Core

### 2.1 Organizaciones y Propiedades

El módulo fundacional. Sin él, nada existe.

**Qué hace:**
- CRUD de organizaciones (crear hotel, configurar datos legales, zona horaria, moneda)
- CRUD de propiedades (crear sede, configurar dirección, horarios, políticas)
- Configuración de branding (logo, colores, tipografía)
- Configuración de dominio web

**Depende de:** Nada
**Dependido por:** Todos los demás módulos

### 2.2 Usuarios y Roles

Gestión de acceso al sistema.

**Qué hace:**
- CRUD de usuarios internos del hotel
- Asignación de roles predefinidos (owner, manager, recepción, housekeeping, mantenimiento)
- Asignación de acceso a propiedades
- Autenticación (login, logout, refresh token)
- Control de acceso por rol en cada endpoint

**Depende de:** Organizaciones
**Dependido por:** Todos los módulos que requieren autenticación

### 2.3 Habitaciones

Gestión del inventario físico del hotel.

**Qué hace:**
- CRUD de tipos de habitación (nombre, descripción, capacidad, amenidades, fotos)
- Definición de configuraciones de camas permitidas por tipo
- CRUD de habitaciones individuales (número, piso, tipo)
- Máquina de estados de habitación (DISPONIBLE → OCUPADA → SUCIA → EN_LIMPIEZA → EN_INSPECCION → DISPONIBLE)
- Gestión de configuración de camas activa por habitación
- Validación de transiciones de estado (el sistema impone las reglas)

**Depende de:** Organizaciones, Propiedades
**Dependido por:** Reservas, Tareas, Motor de Precios, Website

### 2.4 Huéspedes

Registro de las personas que se hospedan.

**Qué hace:**
- CRUD de huéspedes (datos personales, documento, nacionalidad)
- Búsqueda por nombre, email, documento
- Detección de huésped recurrente (ya se hospedó antes en el mismo hotel)
- Historial de estadías del huésped
- Notas internas

**Depende de:** Organizaciones
**Dependido por:** Reservas

### 2.5 Reservas

El corazón operativo. Gestiona el ciclo de vida de las estadías.

**Qué hace:**
- Crear reservas (desde admin o desde API pública del website)
- Máquina de estado operativo (PENDIENTE → CONFIRMADA → CHECK_IN → CHECK_OUT | CANCELADA | NO_SHOW)
- Máquina de estado financiero (PENDIENTE_PAGO → PARCIAL → PAGADA | REEMBOLSO_PARCIAL | REEMBOLSADA)
- Asignación de habitación a reserva
- Validación de disponibilidad (no doble-booking)
- Validación de configuración de camas al hacer check-in
- Registro de origen como entidad tipada (type + metadata)
- Flujos de check-in y check-out con side-effects (cambio de estado de habitación, emisión de eventos)
- Consulta de reserva por código público (para huéspedes)
- Cálculo de noches y total (delegado al motor de precios)

**Depende de:** Organizaciones, Propiedades, Habitaciones, Huéspedes, Motor de Precios
**Dependido por:** Pagos, Motor de Automatizaciones, Dashboard

### 2.6 Motor de Precios

Calcula el precio de las noches según las reglas configuradas por el hotel.

**Qué hace:**
- Definición de temporadas (fechas, nombre, multiplicador)
- Definición de ajustes por día de semana
- Definición de planes tarifarios (estándar, no-reembolsable, early booking)
- Descuentos por duración de estadía
- Promociones (código, porcentaje/monto, fechas de vigencia)
- Pipeline de cálculo: base → temporada → día → ocupación → plan → duración → promoción = precio final
- Snapshot de precio al confirmar reserva (inmutable después)

**Depende de:** Organizaciones, Propiedades, Habitaciones (tipos)
**Dependido por:** Reservas, Website (consulta de disponibilidad)

### 2.7 Pagos

Registro y procesamiento de transacciones monetarias.

**Qué hace:**
- Registrar pagos manuales (efectivo, tarjeta presencial, transferencia)
- Integrar con pasarelas de pago online (interfaz abstracta)
- Recibir webhooks de confirmación de pasarela
- Calcular estado financiero de la reserva (suma de pagos vs total)
- Transicionar estado financiero automáticamente al recibir pago
- Registrar reembolsos

**Interfaz de pasarela (abstracta):**
```
PaymentGateway:
  - initiate_payment(reservation, amount, currency) → redirect_url
  - process_webhook(payload, signature) → PaymentResult
  - initiate_refund(payment, amount) → RefundResult
```

Cada pasarela (Stripe, MercadoPago, OpenPay) implementa esta interfaz. El core no conoce los detalles de ninguna pasarela específica.

**Depende de:** Reservas
**Dependido por:** Motor de Automatizaciones (evento pago.recibido)

### 2.8 Tareas

Gestión operativa de trabajos asignables al staff.

**Qué hace:**
- Crear tareas (manualmente o vía automatizaciones)
- Tipos: limpieza, inspección, mantenimiento, preparación de camas, otro
- Asignar a usuario específico o a rol (el primero disponible del rol la toma)
- Máquina de estados: pendiente → en_progreso → completada
- Fecha límite y prioridad
- Asociación a habitación (opcional)
- Detección de tareas vencidas

**Depende de:** Organizaciones, Propiedades, Habitaciones, Usuarios
**Dependido por:** Motor de Automatizaciones (crear tarea como acción, tarea.completada como trigger)

### 2.9 Motor de Automatizaciones

El cerebro reactivo del sistema. Ejecuta acciones automáticas cuando ocurren eventos.

**Qué hace:**
- Definir reglas: CUANDO [evento] SI [condiciones] ENTONCES [acciones]
- Escuchar eventos del bus interno (reserva.check_out, pago.recibido, tarea.completada, etc.)
- Evaluar condiciones contra datos del evento
- Ejecutar acciones de forma asíncrona (crear tarea, notificar, webhook, cambiar estado habitación, registrar nota)
- Proveer reglas predefinidas activadas por defecto
- Permitir al hotel crear, modificar, activar/desactivar reglas propias
- Logging de cada ejecución (auditoría)
- Protección contra bucles infinitos (rate limit por org, profundidad máxima de cadena)

**Depende de:** Todos los módulos core (escucha eventos de todos)
**Dependido por:** Nada (es el último eslabón de la cadena)

### 2.10 Website

Motor de websites marca blanca para cada hotel.

**Qué hace:**
- Servir website del hotel desde su dominio propio o subdominio
- Resolver tenant por dominio
- Renderizar con branding del hotel (colores, logo, fuentes del módulo Organizaciones)
- Presentar tipos de habitación, fotos, amenidades, precios desde
- Motor de búsqueda de disponibilidad (conectado al backend)
- Flujo de reserva integrado (fechas → tipo → camas → datos → pago)
- Páginas editables desde el admin (home, sobre nosotros, contacto, etc.)
- Consulta de reserva por código
- SEO: meta tags configurables, sitemap, SSR
- Responsive por defecto

**Depende de:** Organizaciones, Propiedades, Habitaciones, Motor de Precios, Reservas, Pagos
**Dependido por:** Nada (es capa de presentación)

### 2.11 Dashboard y Reportes básicos

Vista operativa del estado del hotel.

**Qué hace:**
- Resumen del día: check-ins esperados, check-outs pendientes, ocupación actual
- Estado de habitaciones en tiempo real (mapa visual)
- Reservas del período (lista, calendario)
- Tareas pendientes y vencidas
- Ocupación proyectada (próximos 7/30 días)
- Ingresos del período (solo para owner)

**Depende de:** Reservas, Habitaciones, Tareas, Pagos
**Dependido por:** Nada

---

## 3. Extensiones

Las extensiones se conectan al core a través de interfaces definidas. No modifican el core. El core no las conoce.

### 3.1 Interfaz de extensión

Una extensión puede:
- **Registrar tipos de origen de reserva** → el core acepta nuevos `type` para ReservationOrigin
- **Escuchar eventos del bus** → la extensión recibe eventos y reacciona (sin modificar el flujo del core)
- **Exponer endpoints propios** → bajo un namespace `/extensions/{extension_name}/...`
- **Agregar campos metadata** → en entidades que soporten JSONB metadata (organización, propiedad, reserva)
- **Registrar acciones de automatización** → nuevas acciones disponibles en el motor de reglas

Una extensión NO puede:
- Modificar las máquinas de estado del core
- Bloquear operaciones del core (si la extensión falla, el core sigue funcionando)
- Acceder a datos de otras organizaciones
- Bypassear el control de acceso por rol

### 3.2 Catálogo de extensiones planificadas

#### Channel Manager
**Propósito:** Sincronizar disponibilidad y reservas con OTAs (Booking.com, Airbnb, Expedia).
**Interfaz con el core:**
- Registra tipo de origen `ota` con metadata de plataforma
- Escucha eventos de reserva para sincronizar disponibilidad de vuelta a las OTAs
- Crea reservas vía API privada cuando llegan desde una OTA

#### Comunicaciones
**Propósito:** Enviar mensajes a huéspedes por múltiples canales.
**Interfaz con el core:**
- Registra acción de automatización `enviar_mensaje(canal, plantilla, destinatario)`
- Canales: email, SMS, WhatsApp
- Plantillas configurables por el hotel
- Escucha eventos para envíos automáticos (confirmación, recordatorio, agradecimiento post-estadía)

#### Housekeeping Avanzado
**Propósito:** Gestión detallada del departamento de limpieza.
**Interfaz con el core:**
- Extiende el módulo de tareas con checklists por tipo de habitación
- Agrega reportes de rendimiento por empleado
- Gestión de inventario de amenities y suministros de limpieza
- Turnos y asignación por zonas/pisos

#### Mantenimiento Avanzado
**Propósito:** Gestión detallada del mantenimiento preventivo y correctivo.
**Interfaz con el core:**
- Extiende tareas con categorización de incidencias
- Mantenimiento preventivo programado (calendario)
- Registro fotográfico de incidencias
- Historial de mantenimiento por habitación

#### Domótica
**Propósito:** Control de dispositivos IoT en las habitaciones.
**Interfaz con el core:**
- Escucha eventos de check-in/check-out para activar/desactivar dispositivos
- No es requisito para ninguna operación del core
- Funciona como acción de automatización: `controlar_dispositivo(habitacion, accion)`

#### POS (Punto de Venta)
**Propósito:** Cargos adicionales a la habitación (minibar, restaurante, servicios).
**Interfaz con el core:**
- Agrega cargos a la reserva que se reflejan en el balance financiero
- No modifica el estado financiero directamente — el core calcula el nuevo total
- Reportes de consumo por habitación/huésped

#### Facturación Electrónica
**Propósito:** Emisión de comprobantes fiscales según normativa local.
**Interfaz con el core:**
- Escucha evento de pago completado
- Genera factura/boleta con datos fiscales de la organización y del huésped
- Adaptadores por país (Perú SUNAT, México SAT, Colombia DIAN, etc.)

#### Analytics Avanzado
**Propósito:** Reportes profundos y business intelligence.
**Interfaz con el core:**
- Lee datos de reservas, pagos, ocupación (read-only)
- Genera reportes: RevPAR, ADR, tasa de ocupación por período, origen de reservas, forecast
- No modifica datos del core

#### Programa de Fidelización
**Propósito:** Puntos, beneficios y retención de huéspedes recurrentes.
**Interfaz con el core:**
- Escucha eventos de reserva/check-out para acumular puntos
- Extiende la entidad huésped con balance de puntos y nivel
- Puede generar descuentos que el motor de precios aplica

#### Verificación de Identidad
**Propósito:** Validación automatizada de documentos de identidad.
**Interfaz con el core:**
- Se integra al flujo de registro de huésped (antes o durante check-in)
- Adaptadores por país (RENIEC Perú, INE México, etc.)
- No bloquea el check-in si falla — el recepcionista puede verificar manualmente

---

## 4. Mapa de dependencias

```
Organizaciones ◄──── Propiedades ◄──── Tipos de Habitación ◄──── Habitaciones
      ▲                   ▲                    ▲                      ▲
      │                   │                    │                      │
   Usuarios          Huéspedes          Motor de Precios          Tareas
      ▲                   ▲                    ▲                      ▲
      │                   │                    │                      │
      │              Reservas ─────────────────┘                      │
      │                   ▲                                           │
      │                   │                                           │
      │                Pagos                                          │
      │                   ▲                                           │
      │                   │                                           │
      └────── Motor de Automatizaciones ──────────────────────────────┘
                          ▲
                          │
                     [Extensiones]
                          │
              ┌───────────┼───────────┐
              │           │           │
        Channel Mgr  Comunicaciones  Domótica  ...
```

Flujo de dependencia: de arriba hacia abajo. Las extensiones se conectan al motor de automatizaciones y al bus de eventos, nunca directamente al core de reservas o habitaciones.

---

## 5. Orden de implementación recomendado

### Fase 1 — Fundación
1. Organizaciones y Propiedades
2. Usuarios y Roles (autenticación, autorización)
3. Habitaciones (tipos, habitaciones, máquina de estados, configuración de camas)
4. Huéspedes

### Fase 2 — Operación
5. Motor de Precios (temporadas, días, planes tarifarios)
6. Reservas (máquinas de estado dual, asignación, check-in/check-out)
7. Pagos (registro manual + interfaz de pasarela)
8. Tareas (CRUD, asignación, estados)

### Fase 3 — Automatización e interfaz
9. Motor de Automatizaciones (bus de eventos, reglas, acciones, reglas predefinidas)
10. Website marca blanca (SSR, branding, motor de reservas, páginas editables)
11. Admin Panel (SPA con todos los módulos)
12. Dashboard y Reportes básicos

### Fase 4 — Móvil y Super Admin
13. Admin Móvil (flujos prioritarios: housekeeping, recepción)
14. Super Admin (gestión de organizaciones, monitoreo)

### Fase 5 — Extensiones (según demanda)
15. Comunicaciones (email/WhatsApp para confirmaciones)
16. Facturación electrónica
17. Channel Manager
18. Lo que el mercado pida

Cada fase produce un sistema funcional. Fase 1+2 = un hotel puede operar. Fase 3 = el hotel tiene presencia web y automatizaciones. Fase 4 = operación móvil. Fase 5 = crecimiento.
