import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 px-4">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-500 mb-6">La pagina que buscas no existe.</p>
      <Link
        href="/"
        className="text-primary-600 hover:text-primary-700 font-medium"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
