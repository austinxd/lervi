export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-bold text-indigo-600 mb-3">Lervi</div>
            <p className="text-sm text-gray-500">
              Sistema de gestion para hoteles, hostales y apart-hoteles.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-gray-900">Funcionalidades</a></li>
              <li><a href="#pricing" className="hover:text-gray-900">Planes</a></li>
              <li><a href="#how" className="hover:text-gray-900">Como funciona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900">Centro de ayuda</a></li>
              <li><a href="#" className="hover:text-gray-900">Contacto</a></li>
              <li><a href="#" className="hover:text-gray-900">Estado del sistema</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900">Terminos de servicio</a></li>
              <li><a href="#" className="hover:text-gray-900">Privacidad</a></li>
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
