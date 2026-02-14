import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: 'Gratis',
    period: '',
    description: 'Para empezar a organizar tu hotel.',
    features: [
      '1 propiedad',
      'Hasta 10 habitaciones',
      'Reservas y check-in/out',
      'Website con subdominio',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    href: '/registro',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'S/ 149',
    period: '/mes',
    description: 'Para hoteles que quieren crecer.',
    features: [
      'Hasta 3 propiedades',
      'Habitaciones ilimitadas',
      'Facturacion electronica',
      'Motor de precios avanzado',
      'Automatizaciones',
      'Dominio personalizado',
      'Soporte prioritario',
    ],
    cta: 'Empezar prueba gratis',
    href: '/registro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Contactanos',
    period: '',
    description: 'Para cadenas y operaciones grandes.',
    features: [
      'Propiedades ilimitadas',
      'Todo lo de Pro',
      'API dedicada',
      'Onboarding personalizado',
      'SLA garantizado',
      'Soporte 24/7',
    ],
    cta: 'Contactar ventas',
    href: '/registro',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes simples, sin sorpresas
          </h2>
          <p className="text-gray-500 text-lg">
            Empieza gratis. Escala cuando lo necesites.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? 'text-indigo-100' : 'text-gray-500'}`}>
                {plan.name}
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-indigo-300' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition ${
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
