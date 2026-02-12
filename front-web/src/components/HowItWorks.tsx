const steps = [
  {
    number: '01',
    title: 'Crea tu cuenta',
    description: 'Registra tu hotel en minutos. Sin tarjeta de credito, sin compromisos.',
  },
  {
    number: '02',
    title: 'Configura tu hotel',
    description: 'Agrega habitaciones, tipos, tarifas y politicas. El sistema te guia paso a paso.',
  },
  {
    number: '03',
    title: 'Publica tu website',
    description: 'Tu hotel tiene web propia con motor de reservas. Conecta tu dominio o usa un subdominio gratuito.',
  },
  {
    number: '04',
    title: 'Opera sin fricciones',
    description: 'Reservas, check-in, limpieza, facturacion — todo fluye automaticamente.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Listo en minutos, no en semanas
          </h2>
          <p className="text-gray-500 text-lg">
            Sin instalaciones, sin capacitaciones eternas. Crea tu cuenta y empieza.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={step.number} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                {step.number}
              </div>
              <div className={i < steps.length - 1 ? 'pb-8 border-l-0' : ''}>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
