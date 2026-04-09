import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  ScanBarcode,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

function GestionPrestamos({ user }) {
  const [idLibro, setIdLibro] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePrestamo = async (e) => {
    e.preventDefault();
    if (!idLibro || !correo) return;
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const res = await axios.post(
        '/api/prestamos',
        { id_libro: idLibro, correo_alumno: correo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
          },
        }
      );
      if (res.data.success) {
        setMensaje({ tipo: 'success', texto: res.data.message });
        setIdLibro('');
        setCorreo('');
      }
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.message || 'Error al procesar el préstamo',
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Lado Izquierdo: Formulario */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <form onSubmit={handlePrestamo} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-lanuza">
              <ScanBarcode size={16} /> 1. Escanear el Libro (QR)
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="ID del libro"
              className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl outline-none focus:border-[#7F252E] transition-all text-lg font-bold text-slate-700 font-lanuza"
              value={idLibro}
              onChange={(e) => setIdLibro(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-lanuza">
              <User size={16} /> 2. Correo del Alumno
            </label>
            <input
              type="email"
              placeholder="alumno@juandelanuza.org"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#7F252E] transition-all text-lg font-medium text-slate-700 font-lanuza"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7F252E] text-white py-5 rounded-2xl font-medium text-xl shadow-lg hover:bg-[#631d24] transition-all transform active:scale-95 font-lanuza"
          >
            {loading ? 'Procesando...' : 'CONFIRMAR PRÉSTAMO'}
          </button>
        </form>
      </div>

      {/* Lado Derecho: Feedback */}
      <div className="flex flex-col justify-center font-lanuza">
        {mensaje.texto ? (
          <div
            className={`p-10 rounded-3xl border-2 flex flex-col items-center text-center ${mensaje.tipo === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
          >
            {mensaje.tipo === 'success' ? (
              <CheckCircle2 size={64} />
            ) : (
              <AlertCircle size={64} />
            )}
            <h2 className="text-2xl font-black mb-2 uppercase">
              {mensaje.tipo === 'success' ? '¡LISTO!' : 'ERROR'}
            </h2>
            <p className="text-lg font-medium">{mensaje.texto}</p>
            <button
              onClick={() => setMensaje({ tipo: '', texto: '' })}
              className="mt-6 text-sm font-bold underline uppercase"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-3xl text-slate-300">
            <BookOpen size={80} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold italic">
              Listo para realizar una nueva operación
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionPrestamos;
