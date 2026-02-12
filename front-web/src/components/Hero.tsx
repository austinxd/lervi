export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          Software de gestion hotelera
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Tu hotel organizado,{' '}
          <span className="text-indigo-600">sin esfuerzo</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Reservas, habitaciones, check-in, facturacion y website propio.
          Todo en un solo sistema diseñado para hoteles que quieren crecer sin complicarse.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition text-base"
          >
            Empezar gratis
          </a>
          <a
            href="#how"
            className="border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:border-gray-400 transition text-base"
          >
            Ver como funciona
          </a>
        </div>

        {/* Metrics */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">&lt;2min</div>
            <div className="text-sm text-gray-500">Setup</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">24/7</div>
            <div className="text-sm text-gray-500">Soporte</div>
          </div>
        </div>
      </div>
    </section>
  )
}
