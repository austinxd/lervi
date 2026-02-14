import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
    : 'bg-transparent'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">Lervi</Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {isHome ? (
            <>
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Funcionalidades</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Planes</a>
              <a href="#how" className="text-sm text-gray-600 hover:text-gray-900 transition">Como funciona</a>
            </>
          ) : (
            <>
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition">Inicio</Link>
              <Link to="/#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Funcionalidades</Link>
              <Link to="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Planes</Link>
            </>
          )}
          <Link to="/buscar" className="text-sm text-gray-600 hover:text-gray-900 transition">Buscar hotel</Link>
          <a
            href="https://admin.lervi.io"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
          >
            Iniciar sesion
          </a>
          <Link
            to="/registro"
            className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Registrar hotel
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setOpen(!open)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          {isHome ? (
            <>
              <a href="#features" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Funcionalidades</a>
              <a href="#how" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Como funciona</a>
              <a href="#pricing" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Planes</a>
            </>
          ) : (
            <Link to="/" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Inicio</Link>
          )}
          <Link to="/buscar" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Buscar hotel</Link>
          <a href="https://admin.lervi.io" className="block text-sm font-medium text-indigo-600">Iniciar sesion</a>
          <Link to="/registro" className="block text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg text-center" onClick={() => setOpen(false)}>Registrar hotel</Link>
        </div>
      )}
    </nav>
  )
}
