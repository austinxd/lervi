import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerHotel } from '../lib/api'

interface FormData {
  hotel_name: string
  city: string
  country: string
  stars: string
  owner_name: string
  owner_email: string
  owner_password: string
  owner_password_confirm: string
  phone: string
  template: string
  primary_color: string
  subdomain: string
}

const countries = [
  { code: 'PE', name: 'Peru' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'MX', name: 'Mexico' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
]

const templates = [
  { id: 'essential', name: 'Essential', desc: 'Limpio y minimalista. Ideal para hostales y hoteles boutique.' },
  { id: 'signature', name: 'Signature', desc: 'Elegante y moderno. Para hoteles con identidad propia.' },
  { id: 'premium', name: 'Premium', desc: 'Sofisticado y premium. Para hoteles de lujo.' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ subdomain: string; message: string } | null>(null)
  const [form, setForm] = useState<FormData>({
    hotel_name: '',
    city: '',
    country: 'PE',
    stars: '',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    owner_password_confirm: '',
    phone: '',
    template: 'signature',
    primary_color: '#4F46E5',
    subdomain: '',
  })

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'hotel_name') {
        next.subdomain = slugify(value)
      }
      return next
    })
    setError('')
  }

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.hotel_name.trim()) { setError('El nombre del hotel es requerido.'); return false }
    }
    if (step === 2) {
      if (!form.owner_name.trim()) { setError('El nombre del propietario es requerido.'); return false }
      if (!form.owner_email.trim()) { setError('El email es requerido.'); return false }
      if (form.owner_password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return false }
      if (form.owner_password !== form.owner_password_confirm) { setError('Las contraseñas no coinciden.'); return false }
    }
    return true
  }

  const next = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 4))
  }
  const prev = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await registerHotel({
        hotel_name: form.hotel_name,
        owner_name: form.owner_name,
        owner_email: form.owner_email,
        owner_password: form.owner_password,
        phone: form.phone,
        city: form.city,
        country: form.country,
        primary_color: form.primary_color,
        template: form.template,
      })
      setSuccess({ subdomain: res.organization_subdomain, message: res.message })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar hotel')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">¡Hotel creado!</h1>
          <p className="text-gray-500 mb-2">{success.message}</p>
          <p className="text-sm text-gray-400 mb-8">
            Tu subdominio: <span className="font-mono font-medium text-indigo-600">{success.subdomain}.lervi.io</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://admin.lervi.io"
              className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Ir al panel de admin
            </a>
            <Link
              to="/"
              className="border border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:border-gray-400 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Registrar tu hotel</h1>
          <p className="text-gray-500">Crea tu cuenta en menos de 2 minutos. Sin tarjeta de credito.</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10 max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                s <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {/* Step 1: Hotel data */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Datos del hotel</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del hotel *</label>
                  <input
                    type="text"
                    value={form.hotel_name}
                    onChange={e => update('hotel_name', e.target.value)}
                    placeholder="Hotel Los Pinos"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                      placeholder="Lima"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pais</label>
                    <select
                      value={form.country}
                      onChange={e => update('country', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                    >
                      {countries.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (estrellas)</label>
                  <select
                    value={form.stars}
                    onChange={e => update('stars', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Sin clasificacion</option>
                    <option value="1">1 estrella</option>
                    <option value="2">2 estrellas</option>
                    <option value="3">3 estrellas</option>
                    <option value="4">4 estrellas</option>
                    <option value="5">5 estrellas</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Owner data */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Datos del propietario</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    value={form.owner_name}
                    onChange={e => update('owner_name', e.target.value)}
                    placeholder="Juan Perez"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.owner_email}
                    onChange={e => update('owner_email', e.target.value)}
                    placeholder="juan@hotel.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+51 999 999 999"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                    <input
                      type="password"
                      value={form.owner_password}
                      onChange={e => update('owner_password', e.target.value)}
                      placeholder="Minimo 8 caracteres"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
                    <input
                      type="password"
                      value={form.owner_password_confirm}
                      onChange={e => update('owner_password_confirm', e.target.value)}
                      placeholder="Repetir contraseña"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Personalization */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Personalizacion</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Template visual</label>
                  <div className="grid grid-cols-3 gap-3">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => update('template', t.id)}
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          form.template === t.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-semibold mb-1">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color primario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={e => update('primary_color', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 font-mono">{form.primary_color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subdominio</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={form.subdomain}
                      onChange={e => update('subdomain', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-l-xl border border-r-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                    />
                    <span className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-r-xl text-sm text-gray-500">
                      .lervi.io
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Confirmar registro</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hotel</span>
                    <span className="font-medium">{form.hotel_name}</span>
                  </div>
                  {form.city && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ciudad</span>
                      <span className="font-medium">{form.city}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pais</span>
                    <span className="font-medium">{countries.find(c => c.code === form.country)?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Propietario</span>
                    <span className="font-medium">{form.owner_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium">{form.owner_email}</span>
                  </div>
                  {form.phone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Telefono</span>
                      <span className="font-medium">{form.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Template</span>
                    <span className="font-medium capitalize">{form.template}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subdominio</span>
                    <span className="font-medium font-mono">{form.subdomain || slugify(form.hotel_name)}.lervi.io</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Al registrarte aceptas los terminos de servicio y politica de privacidad.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={prev}
                className="text-sm text-gray-600 font-medium px-6 py-3 rounded-xl border border-gray-300 hover:border-gray-400 transition"
              >
                Anterior
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={next}
                className="text-sm font-medium bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-sm font-medium bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando hotel...' : 'Crear mi hotel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
