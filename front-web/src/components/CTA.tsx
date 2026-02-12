export default function CTA() {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Deja de improvisar, empieza a operar
        </h2>
        <p className="text-gray-500 text-lg mb-10">
          Crea tu cuenta en 2 minutos. Sin tarjeta de credito. Sin compromiso.
          Tu hotel merece un sistema que funcione.
        </p>

        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="tu@hotel.com"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition text-sm whitespace-nowrap">
            Empezar gratis
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Plan Starter gratuito para siempre. Upgrade cuando quieras.
        </p>
      </div>
    </section>
  )
}
