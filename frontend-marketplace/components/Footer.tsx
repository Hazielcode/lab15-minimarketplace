export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm">
          &copy; {currentYear} Marketplace Advanced Web App. Todos los derechos reservados.
        </p>
        <div className="flex space-x-6 mt-4 sm:mt-0 text-sm">
          <span className="hover:text-white cursor-pointer transition-colors">Semana 15 - Laboratorio</span>
          <span className="hover:text-white cursor-pointer transition-colors">Seguridad y Categorías</span>
        </div>
      </div>
    </footer>
  );
}
