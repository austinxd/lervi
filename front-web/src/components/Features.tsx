const features = [
  {
    title: 'Reservas inteligentes',
    description: 'Doble maquina de estados: operativa y financiera. Gestiona check-in, check-out, pagos parciales, reembolsos y estados personalizados. Cada reserva tiene su propio flujo claro — sin confusion ni errores manuales.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Habitaciones con estado real',
    description: 'Disponible, ocupada, sucia, en limpieza, inspeccion, mantenimiento. El sistema impone transiciones validas — tu equipo siempre sabe que hacer con cada habitacion sin preguntar.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Website propio con reservas',
    description: 'Cada hotel tiene su pagina web con branding propio, motor de reservas en tiempo real, galeria de fotos y dominio personalizado. Tus huespedes reservan directamente — sin comisiones de terceros.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: 'Facturacion electronica',
    description: 'Boletas y facturas electronicas automaticas al checkout. Compatible con Nubefact, eFact o tu propio sistema via webhook. Cumple con la normativa de SUNAT sin esfuerzo adicional.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    title: 'Motor de precios avanzado',
    description: 'Tarifas por temporada, dia de semana, ocupacion, duracion de estadia y promociones con codigo. El motor calcula el precio correcto noche a noche, automaticamente.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Automatizaciones sin codigo',
    description: 'Reglas event-driven: al hacer checkout, crear tarea de limpieza. Al confirmar reserva, notificar al huesped por email. Define reglas y el sistema ejecuta — sin necesidad de programar.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que tu hotel necesita
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Un sistema completo que impone orden operativo desde el primer dia.
            Sin parches, sin hojas de calculo, sin caos.
          </p>
        </div>

        <div className="space-y-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-col md:flex-row items-start gap-6 bg-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 transition ${
                i % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                {f.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
