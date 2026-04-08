import { Mail, Clock, MapPin, ShieldCheck } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto font-lanuza">
      <div className="w-full px-4 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* COLUMNA 1: INFO COLEGIO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h3 className="font-bold text-[#7F252E] uppercase tracking-wider">
                Lanuza Libros
              </h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Sistema interno de gestión bibliotecaria para alumnos y docentes
              del Colegio Juan de Lanuza.
            </p>
          </div>

          {/* COLUMNA 2: BIBLIOTECA FÍSICA */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-black uppercase tracking-[0.2em]">
              La Biblioteca
            </h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-[#7F252E]" />
                <span>Lunes a Viernes: 09:00 — 17:00</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-[#7F252E]" />
                <span>Planta 1 — Edificio A</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#7F252E]" />
                <span>Máximo 3 libros por alumno</span>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: SOPORTE TÉCNICO */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-black uppercase tracking-[0.2em]">
              Soporte
            </h4>
            <p className="text-sm text-slate-500">
              ¿Problemas con la web? Contacta con el administrador:
            </p>
            <a
              href="mailto:informatica@juandelanuza.org"
              className="inline-flex items-center gap-3 text-sm font-bold text-[#7F252E] hover:underline"
            >
              <Mail size={18} />
              informatica@juandelanuza.org
            </a>
            <div className="pt-2">
              <p className="text-[10px] text-slate-400 font-medium">
                VERSIÓN DEL SISTEMA: 1.0.0
              </p>
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR DE CRÉDITOS */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Colegio Juan de Lanuza. Todos los
            derechos reservados.
          </p>
          <p className="text-xs font-bold text-slate-500">
            Desarrollado por <span className="text-[#7F252E]">Jorge</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
