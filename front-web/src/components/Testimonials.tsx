const testimonials = [
  {
    name: 'Carlos Mendoza',
    role: 'Gerente General',
    hotel: 'Hotel Sol de Cusco',
    city: 'Cusco',
    quote: 'Antes usabamos hojas de Excel para todo. Con Lervi, las reservas se organizan solas, el equipo de limpieza sabe que habitaciones atender y la facturacion es automatica. Nos ahorramos horas cada dia.',
  },
  {
    name: 'Maria Elena Torres',
    role: 'Propietaria',
    hotel: 'Hostal Vista al Mar',
    city: 'Mancora',
    quote: 'Lo que mas me gusta es el website propio. Mis huespedes reservan directo sin pagar comisiones a terceros. El motor de precios ajusta tarifas por temporada y yo no tengo que hacer nada.',
  },
  {
    name: 'Roberto Sanchez',
    role: 'Director de Operaciones',
    hotel: 'Apart Hotel Lima Central',
    city: 'Lima',
    quote: 'Manejamos 3 propiedades desde un solo panel. Las automatizaciones son un cambio total — al hacer checkout se crea la tarea de limpieza automaticamente. Mi equipo opera sin improvisar.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hoteles que ya operan con Lervi
          </h2>
          <p className="text-gray-500 text-lg">
            Escucha lo que dicen los hoteleros que usan nuestro sistema.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role} — {t.hotel}, {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
