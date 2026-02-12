import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-xl font-bold text-indigo-600">Lervi</a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Funcionalidades</a>
          <a href="#how" className="text-sm text-gray-600 hover:text-gray-900">Como funciona</a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Planes</a>
          <a
            href="https://admin.lervi.io"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Iniciar sesion
          </a>
          <a
            href="#contact"
            className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Empezar gratis
          </a>
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
          <a href="#features" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Funcionalidades</a>
          <a href="#how" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Como funciona</a>
          <a href="#pricing" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Planes</a>
          <a href="https://admin.lervi.io" className="block text-sm font-medium text-indigo-600">Iniciar sesion</a>
          <a href="#contact" className="block text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg text-center">Empezar gratis</a>
        </div>
      )}
    </nav>
  )
}
