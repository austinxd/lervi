# Lervi — Diseño Conceptual

## 1. Qué es Lervi

Lervi es un sistema operativo para hoteles pequeños y medianos, hostales formales y apart-hoteles. No es un PMS tradicional ni un SaaS genérico. Es un sistema que **impone orden operativo** sobre la operación hotelera, reduciendo la fricción humana y estandarizando procesos para que el hotel escale sin aumentar trabajo humano.

---

## 2. Principios de diseño

### 2.1 El sistema manda, no el usuario
Los flujos están definidos por diseño. No hay "libertad creativa" para el recepcionista — hay pasos claros, estados válidos y transiciones permitidas. El sistema no se adapta a los malos hábitos del hotel; el hotel se adapta al sistema.

### 2.2 Cada hotel es una isla
Una organización nunca ve, toca ni comparte datos con otra. Los huéspedes pertenecen al hotel, no a Lervi. No hay marketplace, no hay red compartida, no hay "descubrir hoteles".

### 2.3 El backend es la verdad
Toda validación, toda regla de negocio, todo cálculo de precio, toda transición de estado ocurre en el backend. El frontend solo presenta y captura. Un frontend roto no puede corromper datos.

### 2.4 Automatizar antes que capacitar
Si una acción puede derivarse de un evento (check-out → habitación sucia → tarea de limpieza), el sistema la ejecuta automáticamente. El usuario no necesita "recordar" hacer cosas.

### 2.5 Core estricto, extensiones opcionales
El núcleo resuelve: habitaciones, reservas, huéspedes, usuarios, precios, pagos, website. Todo lo demás (domótica, POS, canales externos) es extensión. El core nunca depende de una extensión.

### 2.6 Sin feature creep
Cada funcionalidad justifica su existencia respondiendo: ¿esto reduce fricción operativa real? Si la respuesta es "sería cool tenerlo", no entra.

---

## 3. Actores del sistema

### 3.1 Externos (no autenticados en el admin)
- **Huésped potencial**: Navega el website del hotel, busca disponibilidad, hace una reserva.
- **Huésped activo**: Tiene una reserva confirmada o está alojado. Puede consultar su reserva.

### 3.2 Internos (usuarios del hotel, autenticados)
- **Owner**: Dueño del hotel. Acceso total. Configura el sistema, ve reportes financieros, gestiona usuarios.
- **Manager**: Gerente operativo. Gestiona reservas, tareas, configuración operativa. No ve configuración financiera sensible.
- **Recepción**: Gestiona check-in/check-out, asigna habitaciones, registra huéspedes, cobra pagos.
- **Housekeeping**: Ve y completa tareas de limpieza asignadas. Reporta estado de habitaciones.
- **Mantenimiento**: Ve y completa tareas de mantenimiento. Reporta incidencias.

### 3.3 Sistema (Lervi interno)
- **Super Admin**: Gestiona organizaciones, suscripciones, monitoreo del sistema. No ve datos de huéspedes ni reservas de ningún hotel.

---

## 4. Conceptos fundamentales del dominio

### 4.1 Organización

La entidad raíz. Representa un hotel, un hostal, un apart-hotel o una cadena pequeña. Todo dato en el sistema pertenece a una organización. Es el boundary de aislamiento.

Una organización tiene:
- Identidad legal (nombre comercial, razón social, identificación fiscal, dirección fiscal)
- Configuración operativa (zona horaria, moneda principal, idioma)
- Branding (logo, colores primario/secundario, tipografía)
- Dominio web (propio o subdominio de Lervi)
- Plan de suscripción

### 4.2 Propiedad

Un edificio físico que pertenece a una organización. Una organización puede tener múltiples propiedades (ej: una cadena con 3 sedes).

Una propiedad define:
- Nombre y ubicación física (dirección, coordenadas)
- Horarios de check-in y check-out
- Políticas (cancelación, menores, mascotas, depósito)
- Amenidades generales del establecimiento
- Contacto operativo (teléfono, email de recepción)
- Fotos generales

### 4.3 Tipo de Habitación

Categoría de habitación dentro de una propiedad. Define las características compartidas por habitaciones similares. Ejemplo: "Suite Doble", "Habitación Estándar", "Departamento Familiar".

Un tipo de habitación define:
- Nombre y descripción
- Capacidad (adultos máximo, niños máximo)
- Configuraciones de camas permitidas (ej: DOBLE, TWIN)
- Amenidades incluidas
- Fotos
- Precio base de referencia (los precios reales los calcula el motor de precios)

### 4.4 Habitación

Unidad física individual. Tiene un número, pertenece a un tipo, y tiene un **estado operativo** que refleja su condición real en todo momento.

**Máquina de estados de habitación:**

```
DISPONIBLE ───→ OCUPADA           (check-in ejecutado)
OCUPADA ───→ SUCIA                (check-out ejecutado)
SUCIA ───→ EN_LIMPIEZA            (housekeeping toma la tarea)
EN_LIMPIEZA ───→ EN_INSPECCION    (limpieza reportada como completada)
EN_INSPECCION ───→ DISPONIBLE     (inspección aprobada)
EN_INSPECCION ───→ SUCIA          (inspección rechazada, con nota)

DISPONIBLE ───→ BLOQUEADA         (bloqueo manual por owner/manager)
BLOQUEADA ───→ DISPONIBLE         (desbloqueo manual)

DISPONIBLE ───→ MANTENIMIENTO     (incidencia reportada)
MANTENIMIENTO ───→ DISPONIBLE     (mantenimiento completado y verificado)
```

No hay atajos. Una habitación SUCIA no puede pasar a DISPONIBLE sin pasar por limpieza e inspección. El sistema impone esto.

#### 4.4.1 Configuración de Camas

Una habitación física puede soportar una o más configuraciones de camas, sin cambiar su identidad ni su estado operativo. La configuración de camas es una capa separada del estado de la habitación y representa cómo está preparada físicamente para recibir huéspedes.

Configuraciones ejemplo:
- **DOBLE** → 1 cama matrimonial
- **TWIN** → 2 camas individuales
- **TRIPLE** → 3 camas (según tipo permitido)

Reglas:
- La habitación física no cambia de identidad al cambiar configuración.
- La configuración activa debe ser una de las permitidas por el tipo de habitación.
- Una reserva puede solicitar una configuración específica.
- El sistema garantiza que la habitación esté preparada en la configuración solicitada antes del check-in.

Relación con housekeeping:
- Cambiar la configuración de camas genera una tarea operativa específica.
- No se permite cambiar configuración sin una tarea registrada y completada.
- El check-in no puede ejecutarse si la configuración requerida no está preparada.

Esto permite modelar habitaciones convertibles (Doble/Twin) sin duplicar inventario ni romper disponibilidad.

### 4.5 Huésped

Persona que se hospeda o ha hecho una reserva en el hotel. Pertenece **exclusivamente** a la organización. Nunca es compartido entre hoteles.

Un huésped tiene:
- Datos personales (nombre, apellido, email, teléfono)
- Documento de identidad (tipo + número)
- Nacionalidad y país de residencia
- Historial de estadías (dentro del mismo hotel/cadena)
- Notas internas del staff

### 4.6 Reserva

Registro central de una estadía planeada o en curso. Tiene **dos dimensiones de estado independientes**: operativa y financiera. Ambas avanzan por su propia máquina de estados sin contaminarse.

#### Estado operativo (ciclo de vida de la estadía)

```
PENDIENTE ───→ CONFIRMADA         (aprobación manual o regla automática)
CONFIRMADA ───→ CHECK_IN          (huésped llega, habitación asignada)
CHECK_IN ───→ CHECK_OUT           (huésped sale)

PENDIENTE ───→ CANCELADA          (cancelación antes de confirmar)
CONFIRMADA ───→ CANCELADA         (cancelación con política aplicada)
CONFIRMADA ───→ NO_SHOW           (no se presentó dentro del plazo)
```

#### Estado financiero (ciclo de vida del dinero)

```
PENDIENTE_PAGO ───→ PARCIAL           (anticipo recibido, saldo pendiente)
PENDIENTE_PAGO ───→ PAGADA            (pago total recibido)
PARCIAL ───→ PAGADA                   (saldo completado)

PAGADA ───→ REEMBOLSO_PARCIAL         (devolución parcial)
PAGADA ───→ REEMBOLSADA               (devolución total)
PARCIAL ───→ REEMBOLSADA              (devolución de lo pagado)
```

**Los dos estados son independientes.** Una reserva puede estar operativamente en CHECK_IN y financieramente en PARCIAL (huésped alojado, falta cobrar el saldo). O CANCELADA y REEMBOLSO_PARCIAL (canceló pero solo le devolvieron parte según la política).

Esta separación elimina:
- Lógicas condicionales complejas ("¿está confirmada porque pagó o porque el manager la aprobó?")
- Parches para manejar anticipos y pagos parciales
- Confusión en reportes ("¿cuántas reservas confirmadas tenemos?" vs "¿cuánto dinero nos deben?")

#### Atributos de la reserva
- Huésped principal
- Propiedad
- Tipo de habitación solicitado
- Habitación asignada (puede asignarse al confirmar o al check-in)
- Configuración de camas solicitada
- Fechas de entrada y salida
- Número de adultos y niños
- Monto total calculado y moneda
- Origen (ver sección 4.7)
- Solicitudes especiales (texto libre)

### 4.7 Origen de Reserva

El origen no es un string. Es una **entidad tipada** con un `type` definido y un `metadata` extensible.

El core define los tipos base:

| type | Significado | metadata ejemplo |
|------|-------------|------------------|
| `website` | Reserva desde el website del hotel | `{ page: "home", locale: "es" }` |
| `walk_in` | Huésped llegó sin reserva | `{ receptionist_id: "usr_123" }` |
| `phone` | Reserva por teléfono | `{ received_by: "usr_456" }` |

Las extensiones pueden registrar tipos adicionales:

| type | Extensión | metadata ejemplo |
|------|-----------|------------------|
| `ota` | Channel Manager | `{ platform: "booking.com", external_id: "BK-928374", commission: 15 }` |
| `campaign` | Marketing | `{ campaign_id: "verano-2026", utm_source: "instagram" }` |
| `partner` | Partners | `{ partner_id: "agencia_lima", agreement: "net_rate" }` |
| `whatsapp` | Comunicaciones | `{ conversation_id: "wa_789", agent_id: "usr_321" }` |

El core solo necesita conocer el `type` para reportes y filtros básicos. El `metadata` es consumido por la extensión que registró el tipo. Cada tipo tiene un esquema definido — no es JSON arbitrario.

### 4.8 Tarifa

El precio de una noche para un tipo de habitación en una fecha específica. Las tarifas se calculan dinámicamente según:
- Precio base del tipo de habitación
- Temporada definida por el hotel (alta, baja, media, personalizada)
- Día de la semana (fin de semana vs entre semana)
- Ocupación actual de la propiedad
- Reglas de pricing configuradas
- Promociones o descuentos activos
- Duración de la estadía (descuento por N+ noches)
- Plan tarifario aplicado (estándar, no-reembolsable, early booking)

El motor de precios resuelve el precio final. El frontend nunca calcula precios.

### 4.9 Pago

Registro de una transacción monetaria asociada a una reserva. Puede haber múltiples pagos por reserva (anticipo + saldo).

Un pago tiene:
- Monto y moneda
- Método (efectivo, tarjeta presencial, transferencia, pasarela online)
- Estado (pendiente, completado, reembolsado, fallido)
- Referencia de pasarela (si aplica)
- Registrado por (usuario que procesó el pago)
- Timestamp de procesamiento

La suma de pagos completados determina el estado financiero de la reserva. Esta relación la calcula el backend.

### 4.10 Tarea

Acción operativa asignada a un rol o usuario. Puede ser creada manualmente o generada automáticamente por el motor de automatizaciones.

Una tarea tiene:
- Tipo (limpieza, inspección, mantenimiento, preparación de camas, otro)
- Propiedad y habitación asociada (opcional)
- Asignada a (usuario específico o rol)
- Prioridad (normal, alta, urgente)
- Estado (pendiente, en_progreso, completada)
- Fecha límite
- Notas y resultado

### 4.11 Regla de Automatización

Instrucción configurable que conecta eventos del sistema con acciones automáticas. Se detalla en la sección 7.

---

## 5. Flujos operativos principales

### 5.1 Reserva desde el website

```
Huésped entra al website del hotel
  → Selecciona fechas de entrada y salida
  → Backend calcula disponibilidad en tiempo real
  → Retorna tipos de habitación disponibles con precios calculados
  → Huésped selecciona tipo de habitación (y configuración de camas si aplica)
  → Huésped llena datos personales
  → Backend crea reserva:
      estado operativo = PENDIENTE
      estado financiero = PENDIENTE_PAGO
      origen = { type: "website", metadata: { ... } }
  → Redirige a pasarela de pago
  → Pago exitoso:
      → Backend registra pago
      → Estado financiero → PAGADA (o PARCIAL si es anticipo)
      → Motor de automatizaciones evalúa reglas post-pago
      → Si regla dice "confirmar automáticamente cuando hay pago":
          estado operativo → CONFIRMADA
      → Automatizaciones post-confirmación se ejecutan
      → Huésped recibe confirmación
```

### 5.2 Check-in

```
Recepcionista busca reserva (por nombre, código o fecha)
  → Sistema muestra reserva CONFIRMADA
  → Si no hay habitación asignada:
      → Sistema muestra habitaciones DISPONIBLES del tipo solicitado
      → Recepcionista selecciona una
  → Sistema valida:
      → La habitación está en estado DISPONIBLE
      → La configuración de camas activa coincide con la solicitada
      → (si no coincide: bloquea check-in, muestra alerta, ofrece crear tarea de preparación)
  → Recepcionista verifica documento del huésped
  → Ejecuta check-in
  → Backend:
      → Reserva: estado operativo → CHECK_IN
      → Habitación: estado → OCUPADA
      → Motor de automatizaciones evalúa reglas post-check-in
```

### 5.3 Check-out

```
Recepcionista inicia check-out
  → Sistema muestra reserva en CHECK_IN
  → Sistema muestra estado financiero actual
  → Si estado financiero es PARCIAL o PENDIENTE_PAGO:
      → Recepcionista debe registrar pago del saldo
      → (o el owner/manager puede autorizar check-out con deuda, según política)
  → Ejecuta check-out
  → Backend:
      → Reserva: estado operativo → CHECK_OUT
      → Habitación: estado → SUCIA
      → Motor de automatizaciones:
          → Crea tarea de limpieza automáticamente
          → Notifica a housekeeping
```

### 5.4 Ciclo de limpieza

```
Housekeeping ve lista de tareas pendientes (habitaciones SUCIAS)
  → Toma una tarea
  → Backend: habitación → EN_LIMPIEZA
  → Completa la limpieza, reporta desde su interfaz
  → Backend: habitación → EN_INSPECCION
  → Manager o recepción inspecciona
  → Aprueba → Backend: habitación → DISPONIBLE
  → Rechaza → Backend: habitación → SUCIA (con nota del motivo)
      → Nueva tarea de limpieza creada automáticamente
```

### 5.5 Walk-in (huésped sin reserva)

```
Huésped llega sin reserva
  → Recepcionista consulta disponibilidad para hoy
  → Sistema muestra habitaciones DISPONIBLES con configuración actual
  → Recepcionista registra huésped (datos personales + documento)
  → Crea reserva:
      → origen: { type: "walk_in", metadata: { receptionist_id: "..." } }
      → fechas: hoy → fecha de salida
      → estado operativo: PENDIENTE
      → estado financiero: PENDIENTE_PAGO
  → Registra pago (efectivo, tarjeta)
  → Confirma reserva → CONFIRMADA
  → Ejecuta check-in → CHECK_IN + habitación OCUPADA
  → (flujo guiado: pantallas consecutivas sin saltos)
```

### 5.6 Cambio de configuración de camas

```
Próxima reserva solicita configuración TWIN en habitación que está en DOBLE
  → Sistema detecta discrepancia al asignar habitación
  → Crea tarea de preparación de camas (tipo: preparación_camas)
  → Asigna a housekeeping con prioridad y fecha límite (antes del check-in)
  → Housekeeping ejecuta el cambio y completa la tarea
  → Sistema actualiza configuración activa de la habitación
  → Check-in desbloqueado
```

---

## 6. Website marca blanca

Cada hotel tiene un website propio que:

1. **Se sirve desde su dominio** (ej: `hotelmirador.com`) o un subdominio (ej: `mirador.lervi.com`)
2. **Tiene branding propio**: logo, colores, tipografía — todo configurado desde el panel admin
3. **Tiene contenido editable**: páginas, textos, fotos, amenidades — gestionable desde el admin sin tocar código
4. **Tiene motor de reservas integrado**: no es un widget externo ni un iframe. El buscador de disponibilidad y el flujo de reserva son nativos del website
5. **Es SEO-friendly**: renderizado del lado del servidor, meta tags configurables, URLs limpias
6. **Es responsive**: funciona en móvil sin app separada para el huésped

El website NO tiene lógica propia. Consume la API del backend. La disponibilidad, los precios y la creación de reservas son operaciones del backend.

### Páginas mínimas
- **Home**: hero, buscador de disponibilidad, tipos de habitación destacados, amenidades, ubicación
- **Habitaciones**: listado de tipos con fotos, descripción, capacidad, configuraciones disponibles, precio desde
- **Detalle de habitación**: galería, descripción completa, amenidades, buscador contextual
- **Reservar**: flujo de selección de fechas → tipo → configuración de camas → datos personales → pago
- **Confirmación**: resumen de reserva con código, fechas, datos de contacto del hotel
- **Consultar reserva**: búsqueda por código para ver estado operativo y financiero

---

## 7. Motor de automatizaciones

Sistema de reglas event-driven que ejecuta acciones cuando ocurren eventos en el sistema.

Estructura: **CUANDO** [evento] **SI** [condiciones] **ENTONCES** [acciones].

### 7.1 Eventos disponibles (triggers)

| Evento | Se dispara cuando... |
|--------|----------------------|
| `reserva.creada` | Se crea una nueva reserva |
| `reserva.confirmada` | Estado operativo pasa a CONFIRMADA |
| `reserva.check_in` | Se ejecuta check-in |
| `reserva.check_out` | Se ejecuta check-out |
| `reserva.cancelada` | Reserva cancelada |
| `reserva.no_show` | Marcada como no-show |
| `pago.recibido` | Pago registrado exitosamente |
| `pago.fallido` | Intento de pago falló |
| `habitacion.estado_cambio` | Cualquier transición de estado de habitación |
| `tarea.completada` | Tarea marcada como completada |
| `tarea.vencida` | Tarea pasó su fecha límite sin completarse |
| `huesped.creado` | Nuevo huésped registrado |
| `huesped.recurrente` | Huésped con estadías previas detectado al crear reserva |

### 7.2 Condiciones (filtros)

- **Comparaciones**: `reserva.origen.type == 'website'`, `habitacion.tipo.nombre == 'suite'`
- **Temporales**: `hora_actual.entre(14:00, 16:00)`, `dias_para_check_in <= 1`
- **Numéricas**: `reserva.monto_total > 500`, `huesped.estadias_previas >= 3`
- **Estado**: `reserva.estado_financiero == 'PAGADA'`
- **Lógica compuesta**: AND, OR entre condiciones

### 7.3 Acciones disponibles

| Acción | Descripción |
|--------|-------------|
| `crear_tarea` | Crea tarea operativa (tipo, asignar a rol, habitación, prioridad, fecha límite) |
| `notificar` | Envía notificación (canal: push/email/webhook, destinatario, plantilla) |
| `cambiar_estado_habitacion` | Transiciona estado de habitación (validando la máquina de estados) |
| `enviar_webhook` | Dispara HTTP POST a URL externa con payload definido |
| `registrar_nota` | Agrega nota interna a una entidad (reserva, huésped, habitación) |

### 7.4 Reglas predefinidas

Vienen activadas por defecto. El owner puede activar, desactivar, modificar o crear las suyas.

| Regla | Trigger | Acción |
|-------|---------|--------|
| Limpieza post check-out | `reserva.check_out` | Habitación → SUCIA + crear tarea de limpieza para housekeeping |
| Inspección post limpieza | `tarea.completada` (tipo: limpieza) | Habitación → EN_INSPECCION |
| Liberar habitación por no-show | `reserva.no_show` | Habitación asignada → DISPONIBLE |
| Recordatorio pre check-in | `reserva.confirmada` + 1 día antes del check-in | Notificar al huésped (email) |
| Alerta tarea vencida | `tarea.vencida` | Notificar a manager |

---

## 8. Lo que Lervi NO es

- **No es Booking.com.** No hay catálogo público de hoteles. Cada hotel es independiente e invisible para los demás.
- **No es un channel manager.** La integración con OTAs es extensión futura, nunca core.
- **No es un CRM genérico.** El registro de huéspedes es operativo, no para marketing masivo.
- **No es un sistema de domótica.** La domótica es extensión opcional, nunca requisito.
- **No es una app para el huésped.** El huésped interactúa via el website. No hay app móvil para huéspedes.
- **No es un ERP.** No maneja contabilidad, nómina ni inventario general.
