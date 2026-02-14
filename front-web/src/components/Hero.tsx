import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="pt-28 pb-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Nuevo — Empieza gratis hoy
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              El sistema completo para{' '}
              <span className="text-indigo-600">gestionar tu hotel</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mb-4 leading-relaxed">
              Lervi es el software todo-en-uno para hoteles, hostales y apart-hoteles.
              Gestiona reservas, habitaciones, check-in/out, facturacion electronica,
              pagos y tu propia pagina web — desde un solo panel.
            </p>

            <p className="text-base text-gray-400 max-w-xl mb-8">
              Sin instalaciones. Sin contratos. Crea tu cuenta en 2 minutos
              y empieza a operar con orden.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/registro"
                className="bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition text-base text-center"
              >
                Registrar mi hotel gratis
              </Link>
              <Link
                to="/buscar"
                className="border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:border-gray-400 transition text-base text-center"
              >
                Buscar hoteles
              </Link>
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-8 aspect-[4/3]">
                {/* Top bar */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/30 rounded w-32 mb-1" />
                    <div className="h-2 bg-white/20 rounded w-20" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-white/20 rounded" />
                    <div className="w-6 h-6 bg-white/20 rounded" />
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['Reservas hoy', 'Ocupacion', 'Ingresos'].map((label) => (
                    <div key={label} className="bg-white/10 backdrop-blur rounded-lg p-3">
                      <div className="text-white/60 text-[10px] mb-1">{label}</div>
                      <div className="h-4 bg-white/30 rounded w-12" />
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                      <div key={d} className="text-center text-white/40 text-[9px]">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-5 rounded text-[8px] flex items-center justify-center ${
                          [2, 3, 7, 8, 9, 14, 15].includes(i)
                            ? 'bg-emerald-400/30 text-white/80'
                            : [5, 6, 12, 13, 19, 20].includes(i)
                            ? 'bg-amber-400/30 text-white/80'
                            : 'bg-white/5 text-white/40'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
