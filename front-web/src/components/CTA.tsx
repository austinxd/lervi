import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Deja de improvisar, empieza a operar
        </h2>
        <p className="text-gray-500 text-lg mb-10">
          Crea tu cuenta en 2 minutos. Sin tarjeta de credito. Sin compromiso.
          Tu hotel merece un sistema que funcione de verdad.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/registro"
            className="bg-indigo-600 text-white font-semibold px-10 py-4 rounded-xl hover:bg-indigo-700 transition text-base"
          >
            Registrar mi hotel gratis
          </Link>
          <Link
            to="/buscar"
            className="border border-gray-300 text-gray-700 font-semibold px-10 py-4 rounded-xl hover:border-gray-400 transition text-base"
          >
            Ver hoteles en Lervi
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Plan Starter gratuito para siempre. Upgrade cuando quieras.
        </p>
      </div>
    </section>
  )
}
