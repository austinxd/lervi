import { useState, useEffect } from 'react'
import { searchHotels, type HotelResult } from '../lib/api'

export default function Search() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [stars, setStars] = useState('')
  const [results, setResults] = useState<HotelResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const pageSize = 12

  const doSearch = async (p = 1) => {
    setLoading(true)
    try {
      const res = await searchHotels({
        q: query || undefined,
        city: city || undefined,
        stars: stars ? Number(stars) : undefined,
        page: p,
      })
      setResults(res.results)
      setTotal(res.count)
      setPage(p)
      setSearched(true)
    } catch {
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    doSearch()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(1)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Buscar hoteles</h1>
          <p className="text-gray-500 text-lg">
            Encuentra hoteles registrados en Lervi y reserva directamente.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Nombre del hotel o ciudad..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Ciudad"
              className="md:w-40 px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <select
              value={stars}
              onChange={e => setStars(e.target.value)}
              className="md:w-40 px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">Estrellas</option>
              <option value="1">1 estrella</option>
              <option value="2">2 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="5">5 estrellas</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition text-sm disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading && !searched ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Cargando hoteles...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">{total} hotel{total !== 1 ? 'es' : ''} encontrado{total !== 1 ? 's' : ''}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((hotel, i) => (
                <a
                  key={`${hotel.subdomain}-${i}`}
                  href={`https://${hotel.subdomain}.lervi.io`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition group"
                >
                  {/* Hero image */}
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                    {hotel.hero_image ? (
                      <img
                        src={hotel.hero_image}
                        alt={hotel.property_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    {hotel.min_price && (
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-semibold">
                        Desde S/ {Number(hotel.min_price).toFixed(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base group-hover:text-indigo-600 transition">{hotel.property_name}</h3>
                      {hotel.stars && (
                        <div className="flex gap-0.5 flex-shrink-0">
                          {Array.from({ length: hotel.stars }).map((_, j) => (
                            <svg key={j} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>

                    {hotel.city && (
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {hotel.city}, {hotel.country}
                      </p>
                    )}

                    {hotel.tagline && (
                      <p className="text-xs text-gray-400 line-clamp-2">{hotel.tagline}</p>
                    )}

                    {hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {hotel.amenities.slice(0, 3).map((a, j) => (
                          <span key={j} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{hotel.amenities.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => doSearch(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-30 hover:border-gray-400 transition"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  Pagina {page} de {totalPages}
                </span>
                <button
                  onClick={() => doSearch(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-30 hover:border-gray-400 transition"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : searched ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron hoteles</h3>
            <p className="text-sm text-gray-400">Intenta con otros terminos de busqueda o filtros.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
