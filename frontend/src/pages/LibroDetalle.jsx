import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Book,
  Hash,
  Calendar,
  Layers,
  User as UserIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

function LibroDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [libro, setLibro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDetalles = async () => {
      try {
        const res = await axios.get(`/api/libros/${id}`);
        setLibro(res.data);
      } catch (error) {
        console.error('Error al obtener detalles', error);
      } finally {
        setLoading(false);
      }
    };
    obtenerDetalles();
  }, [id]);

  const handleImageError = (e) => {
    e.target.src = '/portadas/default.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-lanuza">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#7F252E] rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Cargando ficha...
          </p>
        </div>
      </div>
    );
  }

  if (!libro)
    return (
      <div className="min-h-screen flex items-center justify-center font-lanuza">
        Libro no encontrado
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-lanuza flex flex-col">
      {/* --- 1. BARRA SUPERIOR (NAVBAR) --- */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 md:px-10 flex justify-between items-center mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-xl font-medium text-[#7F252E] uppercase tracking-tighter leading-none">
                Lanuza Libros
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Ficha del ejemplar
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-[#7F252E] font-medium transition-all px-4 py-2 rounded-xl hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver al catálogo</span>
          </button>
        </div>
      </nav>

      {/* --- 2. CONTENIDO PRINCIPAL --- */}
      <main className="flex-grow p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* LADO IZQUIERDO: PORTADA */}
            <div className="md:w-2/5 lg:w-1/3 bg-slate-50 relative group">
              <img
                src={`/portadas/${libro.portada_img}`}
                onError={handleImageError}
                alt={libro.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* LADO DERECHO: INFO Y QR */}
            <div className="p-8 md:p-12 md:w-3/5 lg:w-2/3 flex flex-col">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-8 flex-grow">
                {/* BLOQUE DE TEXTO */}
                <div className="flex-1 space-y-8">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-[1.1] mb-4">
                      {libro.titulo}
                    </h2>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-xs uppercase tracking-widest ${
                        libro.estado === 'Disponible'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-orange-100 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {libro.estado === 'Disponible' ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {libro.estado}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10 border-t border-slate-100 pt-8 text-sm">
                    <p className="flex items-center gap-3 text-slate-500">
                      <UserIcon
                        size={20}
                        className="text-[#7F252E] opacity-80"
                      />
                      <span className="font-bold text-black uppercase text-[11px] tracking-wider w-20">
                        Autor
                      </span>
                      <span className="flex-1">{libro.autor}</span>
                    </p>
                    <p className="flex items-center gap-3 text-slate-500">
                      <Book size={20} className="text-[#7F252E] opacity-80" />
                      <span className="font-bold text-black uppercase text-[11px] tracking-wider w-20">
                        Editorial
                      </span>
                      <span className="flex-1">{libro.editorial}</span>
                    </p>
                    <p className="flex items-center gap-3 text-slate-500">
                      <Layers size={20} className="text-[#7F252E] opacity-80" />
                      <span className="font-bold text-black uppercase text-[11px] tracking-wider w-20">
                        Género
                      </span>
                      <span className="flex-1">{libro.genero}</span>
                    </p>
                    <p className="flex items-center gap-3 text-slate-500">
                      <Calendar
                        size={20}
                        className="text-[#7F252E] opacity-80"
                      />
                      <span className="font-bold text-black uppercase text-[11px] tracking-wider w-20">
                        Año
                      </span>
                      <span className="flex-1">{libro.anyo_publicacion}</span>
                    </p>
                    <p className="flex items-center gap-3 text-slate-500 col-span-full">
                      <Hash size={20} className="text-[#7F252E] opacity-80" />
                      <span className="font-bold text-black uppercase text-[11px] tracking-wider w-20">
                        ISBN
                      </span>
                      <span className="flex-1 font-mono">{libro.isbn}</span>
                    </p>
                  </div>
                </div>

                {/* BLOQUE DEL QR (DISEÑO TIPO TICKET) */}
                <div className="w-full lg:w-56 flex flex-col items-center">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center w-full shadow-inner">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                      Enseña este QR
                    </span>

                    <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 mb-4 transition-transform hover:scale-105 duration-300">
                      <QRCodeSVG
                        value={String(libro.id_libro)}
                        size={140}
                        level={'H'}
                        fgColor="#1e293b"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PIE DE LA FICHA (Opcional: puedes añadir resumen aquí) */}
              <div className="mt-8 pt-6 border-t border-slate-50 text-slate-400 text-[10px] italic">
                * Los préstamos tienen una duración de 15 días naturales.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LibroDetalle;
