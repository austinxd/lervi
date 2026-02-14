import { useState } from 'react'

const faqs = [
  {
    question: '¿Que es Lervi?',
    answer: 'Lervi es un software de gestion hotelera todo-en-uno. Permite administrar reservas, habitaciones, check-in/out, facturacion electronica, pagos, tareas del equipo y tu propia pagina web con motor de reservas — todo desde un solo panel.',
  },
  {
    question: '¿Cuanto cuesta?',
    answer: 'El plan Starter es gratuito para siempre e incluye hasta 10 habitaciones, reservas, check-in/out y una web con subdominio. El plan Pro cuesta S/ 149/mes e incluye facturacion electronica, automatizaciones, dominio propio y soporte prioritario.',
  },
  {
    question: '¿Necesito conocimientos tecnicos?',
    answer: 'No. Lervi esta diseñado para hoteleros, no para programadores. La configuracion es guiada paso a paso y el sistema es intuitivo. Si necesitas ayuda, nuestro equipo de soporte esta disponible.',
  },
  {
    question: '¿Puedo usar mi propio dominio?',
    answer: 'Si. Con el plan Pro puedes conectar tu dominio personalizado (ejemplo: www.mihotel.com) a tu pagina web de Lervi. Con el plan Starter, tu hotel tendra un subdominio gratuito: mihotel.lervi.io.',
  },
  {
    question: '¿Como funciona la facturacion electronica?',
    answer: 'Lervi se integra con proveedores de facturacion electronica como Nubefact y eFact. Al hacer checkout, el sistema puede generar automaticamente boletas y facturas electronicas que cumplen con la normativa de SUNAT. Tambien puedes conectar tu propio sistema via webhook.',
  },
  {
    question: '¿Puedo migrar desde otro sistema?',
    answer: 'Si. Nuestro equipo te ayuda con la migracion de datos desde tu sistema anterior. Contactanos y coordinaremos el proceso para que la transicion sea lo mas fluida posible.',
  },
  {
    question: '¿Hay soporte en español?',
    answer: 'Si. Todo el sistema esta en español. Nuestro equipo de soporte tambien habla español y esta basado en Peru. Respondemos por email, chat y videollamada.',
  },
  {
    question: '¿Que pasa si cancelo?',
    answer: 'Puedes cancelar en cualquier momento sin penalidades. Tus datos se mantienen disponibles por 30 dias despues de cancelar. El plan Starter gratuito no tiene compromiso de ningun tipo.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-500 text-lg">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-sm pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
