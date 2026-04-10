import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  ScanBarcode,
  AlertCircle,
  Trash2,
  Edit,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';

function GestionPrestamos({ user }) {
  const [sortConfig, setSortConfig] = useState({
    key: 'inicio',
    direction: 'DESC',
  });

  const [idLibro, setIdLibro] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);
  const [prestamos, setPrestamos] = useState([]);
  const [editando, setEditando] = useState(null);
  const inputRef = useRef(null);

  const formatFechaInput = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toISOString().split('T')[0];
  };

  const cargarPrestamos = async () => {
    try {
      const res = await axios.get('/api/prestamos-detallados', {
        params: {
          sort: sortConfig.key,
          order: sortConfig.direction,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });
      setPrestamos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
    cargarPrestamos();
  }, [sortConfig]);

  const handlePrestamo = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        cargarPrestamos();
      }
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.message || 'Error',
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro permanentemente?')) return;
    await axios.delete(`/api/prestamos/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
      },
    });
    cargarPrestamos();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/prestamos/${editando.id_prestamo}`, editando, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });
      setEditando(null);
      cargarPrestamos();
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const handleSort = (colKey) => {
    if (sortConfig.key === colKey) {
      setSortConfig({
        key: colKey,
        direction: sortConfig.direction === 'ASC' ? 'DESC' : 'ASC',
      });
    } else {
      setSortConfig({
        key: colKey,
        direction: 'ASC',
      });
    }
  };

  return (
    <div className="w-full px-4 md:px-10 py-6 font-lanuza animate-in fade-in duration-500">
      {/* 1. ALTA RÁPIDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-xl font-black text-[#7F252E] mb-6 uppercase flex items-center gap-2">
            <ScanBarcode size={20} /> Nuevo Préstamo
          </h2>
          <form onSubmit={handlePrestamo} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="ID Libro (Escanear)"
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#7F252E] font-bold"
              value={idLibro}
              onChange={(e) => setIdLibro(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo Alumno"
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#7F252E]"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7F252E] text-white py-4 rounded-2xl font-bold hover:bg-[#631d24] transition-all"
            >
              {loading ? 'Procesando...' : 'CONFIRMAR PRÉSTAMO'}
            </button>
          </form>
          {mensaje.texto && (
            <div
              className={`mt-4 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
            >
              <AlertCircle size={16} /> {mensaje.texto}
            </div>
          )}
        </div>
        <div className="lg:col-span-2 hidden lg:flex items-center justify-center opacity-20 italic text-slate-400">
          Panel de operaciones en tiempo real - Biblioteca Juan de Lanuza
        </div>
      </div>

      {/* 2. TABLA DE HISTORIAL COMPLETA */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black uppercase tracking-tight">
            Historial de Prestamos
          </h2>
        </div>
        <div className="bg-slate-50/30 border-b border-slate-200 overflow-y-scroll scrollbar-invisible">
          <table
            className="w-full text-left table-layout-fixed"
            style={{ tableLayout: 'fixed' }}
          >
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-black">
                {[
                  { label: 'ID', key: 'id', width: '5%' },
                  { label: 'Libro', key: 'libro', width: '20%' },
                  { label: 'Usuario', key: 'alumno', width: '20%' },
                  { label: 'F.Inicio', key: 'inicio', width: '10%' },
                  { label: 'F.Límite', key: 'limite', width: '10%' },
                  { label: 'F.Devolución', key: 'devolucion', width: '10%' },
                  { label: 'Estado', key: 'estado', width: '10%' },
                  { label: 'Acciones', key: 'acciones', width: '15%' },
                ].map((col) => {
                  const estaActiva = sortConfig.key === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{ width: col.width }}
                      className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`transition-colors ${estaActiva ? 'text-[#7F252E] font-black' : 'text-slate-400'}`}
                        >
                          {col.label}
                        </span>
                        <span className="flex items-center">
                          {estaActiva ? (
                            sortConfig.direction === 'ASC' ? (
                              <ArrowUp size={14} className="text-[#7F252E]" />
                            ) : (
                              <ArrowDown size={14} className="text-[#7F252E]" />
                            )
                          ) : (
                            <ArrowUpDown
                              size={14}
                              className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
          </table>
        </div>

        {/* 2. CUERPO DE LA TABLA CON SCROLL (Aquí empieza la barra) */}
        <div className="overflow-y-auto max-h-[600px] bg-white scrollbar-thin">
          <table
            className="w-full text-left table-layout-fixed"
            style={{ tableLayout: 'fixed' }}
          >
            <tbody className="divide-y divide-slate-50">
              {prestamos.map((p) => (
                <tr
                  key={p.id_prestamo}
                  className="hover:bg-slate-50/50 transition-colors text-xs"
                >
                  <td className="p-4 text-slate-400" style={{ width: '5%' }}>
                    #{p.id_prestamo}
                  </td>
                  <td
                    className="p-4 text-slate-500 truncate"
                    title={p.titulo_libro}
                    style={{ width: '20%' }}
                  >
                    {p.titulo_libro}
                  </td>
                  <td className="p-4 text-slate-500" style={{ width: '20%' }}>
                    {p.correo_usuario}
                  </td>
                  <td className="p-4 text-slate-500" style={{ width: '10%' }}>
                    {new Date(p.fecha_inicio).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-slate-500" style={{ width: '10%' }}>
                    {new Date(p.fecha_limite).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-slate-500" style={{ width: '10%' }}>
                    {p.fecha_devolucion
                      ? new Date(p.fecha_devolucion).toLocaleDateString()
                      : '---'}
                  </td>
                  <td className="p-4" style={{ width: '10%' }}>
                    <span
                      className={`px-2 py-1 rounded-md text-[9px] font-black ${p.devuelto ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
                    >
                      {p.devuelto ? 'DEVUELTO' : 'EN USO'}
                    </span>
                  </td>
                  <td className="p-4" style={{ width: '15%' }}>
                    <div className="flex justify-left gap-3">
                      <button
                        onClick={() => setEditando(p)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id_prestamo)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL DE EDICIÓN TOTAL */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-[#7F252E] text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest">
                Editar Registro #{editando.id_prestamo}
              </h3>
              <button
                onClick={() => setEditando(null)}
                className="hover:rotate-90 transition-transform"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  ID Libro
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold"
                  value={editando.id_libro}
                  onChange={(e) =>
                    setEditando({ ...editando, id_libro: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  ID Usuario
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold"
                  value={editando.id_usuario}
                  onChange={(e) =>
                    setEditando({ ...editando, id_usuario: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-blue-500">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  className="w-full p-3 bg-blue-50/30 border border-blue-100 rounded-xl"
                  value={formatFechaInput(editando.fecha_inicio)}
                  onChange={(e) =>
                    setEditando({ ...editando, fecha_inicio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-pink-500">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  className="w-full p-3 bg-red-50/30 border border-pink-100 rounded-xl"
                  value={formatFechaInput(editando.fecha_limite)}
                  onChange={(e) =>
                    setEditando({ ...editando, fecha_limite: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-green-500">
                  Fecha Real de Devolución
                </label>
                <input
                  type="date"
                  className="w-full p-3 bg-green-50/30 border border-green-100 rounded-xl"
                  value={formatFechaInput(editando.fecha_devolucion)}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      fecha_devolucion: e.target.value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-100 rounded-2xl">
                <span className="text-sm font-black text-slate-600 uppercase">
                  ¿Libro entregado?
                </span>
                <input
                  type="checkbox"
                  className="w-6 h-6 accent-green-600"
                  checked={
                    editando.devuelto === 1 || editando.devuelto === true
                  }
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      devuelto: e.target.checked ? 1 : 0,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="px-8 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionPrestamos;
