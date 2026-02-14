import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-xl font-bold text-indigo-600 mb-3 block">Lervi</Link>
            <p className="text-sm text-gray-500">
              Sistema de gestion para hoteles, hostales y apart-hoteles.
              Hecho en Peru para Latinoamerica.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/#features" className="hover:text-gray-900 transition">Funcionalidades</a></li>
              <li><a href="/#pricing" className="hover:text-gray-900 transition">Planes</a></li>
              <li><a href="/#how" className="hover:text-gray-900 transition">Como funciona</a></li>
              <li><Link to="/buscar" className="hover:text-gray-900 transition">Buscar hoteles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Empieza</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/registro" className="hover:text-gray-900 transition">Registrar hotel</Link></li>
              <li><a href="https://admin.lervi.io" className="hover:text-gray-900 transition">Iniciar sesion</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Centro de ayuda</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900 transition">Terminos de servicio</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Privacidad</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Estado del sistema</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Lervi. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
