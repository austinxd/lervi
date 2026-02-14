const stats = [
  { value: '50+', label: 'Hoteles activos' },
  { value: '10,000+', label: 'Reservas procesadas' },
  { value: '15+', label: 'Ciudades' },
  { value: '99.9%', label: 'Uptime garantizado' },
]

export default function Stats() {
  return (
    <section className="py-12 px-6 border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-indigo-600 mb-1">
                {s.value}
              </div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
