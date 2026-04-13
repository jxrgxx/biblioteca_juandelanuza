import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  BookPlus,
  AlertCircle,
  Trash2,
  Edit,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
} from 'lucide-react';

function GestionLibros({ user }) {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [editando, setEditando] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: 'id_libro',
    direction: 'ASC',
  });

  const [searchField, setSearchField] = useState('titulo');
  const [searchValue, setSearchValue] = useState('');

  const [nuevo, setNuevo] = useState({
    titulo: '',
    autor: '',
    editorial: '',
    anyo_publicacion: '',
    genero: '',
    paginas: '',
    isbn: '',
    portada_img: 'default.png',
  });

  const inputRef = useRef(null);

  const cargarLibros = async () => {
    try {
      const res = await axios.get('/api/libros', {
        params: {
          q:
            searchField === 'titulo' || searchField === 'autor'
              ? searchValue
              : '',
          editorial: searchField === 'editorial' ? searchValue : '',
          genero: searchField === 'genero' ? searchValue : '',
          sort: sortConfig.key,
          order: sortConfig.direction,
          page: 1,
          limit: 1000,
        },
      });
      setLibros(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => cargarLibros(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, searchField, sortConfig]);

  const handleSort = (colKey) => {
    setSortConfig({
      key: colKey,
      direction:
        sortConfig.key === colKey && sortConfig.direction === 'ASC'
          ? 'DESC'
          : 'ASC',
    });
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/libros', nuevo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });
      if (res.data.success) {
        setMensaje({ tipo: 'success', texto: 'Libro registrado' });
        setNuevo({
          titulo: '',
          autor: '',
          editorial: '',
          anyo_publicacion: '',
          genero: '',
          paginas: '',
          isbn: '',
          portada_img: 'default.png',
        });
        cargarLibros();
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar' });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este libro permanentemente?')) return;
    await axios.delete(`/api/libros/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
      },
    });
    cargarLibros();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/libros/${editando.id_libro}`, editando, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });
      setEditando(null);
      cargarLibros();
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  return (
    <div className="w-full px-4 md:px-10 py-6 font-lanuza animate-in fade-in duration-500">
      {/* 1. CABECERA: ALTA Y BUSCADOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-xl font-black text-[#7F252E] mb-6 uppercase flex items-center gap-2">
            <BookPlus size={22} className="text-[#7F252E]" /> Nuevo Libro
          </h2>
          <form onSubmit={handleCrear} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Título"
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-[#7F252E] text-sm"
              value={nuevo.titulo}
              onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Autor"
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-sm"
              value={nuevo.autor}
              onChange={(e) => setNuevo({ ...nuevo, autor: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Género"
                className="p-3 bg-slate-50 border rounded-xl text-sm"
                value={nuevo.genero}
                onChange={(e) => setNuevo({ ...nuevo, genero: e.target.value })}
              />
              <input
                type="text"
                placeholder="Editorial"
                className="p-3 bg-slate-50 border rounded-xl text-sm"
                value={nuevo.editorial}
                onChange={(e) =>
                  setNuevo({ ...nuevo, editorial: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Año"
                className="p-3 bg-slate-50 border rounded-xl text-sm"
                value={nuevo.anyo_publicacion}
                onChange={(e) =>
                  setNuevo({ ...nuevo, anyo_publicacion: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Págs"
                className="p-3 bg-slate-50 border rounded-xl text-sm"
                value={nuevo.paginas}
                onChange={(e) =>
                  setNuevo({ ...nuevo, paginas: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="ISBN"
                className="p-3 bg-slate-50 border rounded-xl text-sm"
                value={nuevo.isbn}
                onChange={(e) => setNuevo({ ...nuevo, isbn: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7F252E] text-white py-4 rounded-2xl font-bold hover:bg-[#631d24] transition-all mt-2"
            >
              {loading ? 'Guardando...' : 'REGISTRAR LIBRO'}
            </button>
          </form>
          {mensaje.texto && (
            <div
              className={`mt-4 p-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
            >
              <AlertCircle size={14} /> {mensaje.texto}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-[#7F252E]" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Buscador de Libros
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <select
              className="bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs"
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setSearchValue('');
              }}
            >
              <option value="titulo">Título</option>
              <option value="autor">Autor</option>
              <option value="editorial">Editorial</option>
              <option value="genero">Género</option>
            </select>
            <input
              type="text"
              placeholder={`Buscar por ${searchField}...`}
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#7F252E]"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. TABLA TIPO GESTIÓN PRÉSTAMOS */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase tracking-tight">
            Inventario Completo
          </h2>
        </div>

        {/* CABECERA FIJA */}
        <div className="bg-slate-50/30 border-b border-slate-200 overflow-y-scroll scrollbar-invisible">
          <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="text-[10px] uppercase tracking-widest">
                {[
                  { label: 'ID', key: 'id_libro', width: '5%' },
                  { label: 'Título', key: 'titulo', width: '21%' },
                  { label: 'Autor', key: 'autor', width: '13%' },
                  { label: 'Género', key: 'genero', width: '9%' },
                  { label: 'Editorial', key: 'editorial', width: '9%' },
                  { label: 'Año', key: 'anyo_publicacion', width: '6%' },
                  { label: 'Págs', key: 'paginas', width: '4%' },
                  { label: 'ISBN', key: 'isbn', width: '9%' },
                  { label: 'Estado', key: 'estado', width: '6%' },
                  { label: 'Portada', key: 'portada_img', width: '13%' },
                ].map((col) => {
                  const activa = sortConfig.key === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{ width: col.width }}
                      className="p-2 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={activa ? 'text-[#7F252E]' : ''}>
                          {col.label}
                        </span>
                        <span className="flex items-center">
                          {activa ? (
                            sortConfig.direction === 'ASC' ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            )
                          ) : (
                            <ArrowUpDown
                              size={12}
                              className="opacity-0 group-hover:opacity-100 text-slate-300"
                            />
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th style={{ width: '5%' }} className="p-4">
                  Acciones
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* CUERPO CON SCROLL */}
        <div className="overflow-y-auto max-h-[600px] bg-white">
          <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
            <tbody className="divide-y divide-slate-50">
              {libros.map((l) => (
                <tr
                  key={l.id_libro}
                  className="hover:bg-slate-50 transition-colors text-sm"
                >
                  <td style={{ width: '5%' }} className="p-2 text-slate-500">
                    #{l.id_libro}
                  </td>
                  <td
                    style={{ width: '21%' }}
                    className="p-2 text-slate-500 truncate"
                  >
                    {l.titulo}
                  </td>
                  <td
                    style={{ width: '13%' }}
                    className="p-2 text-slate-500 truncate"
                  >
                    {l.autor}
                  </td>
                  <td style={{ width: '9%' }} className="p-2 text-slate-500">
                    {l.genero}
                  </td>
                  <td
                    style={{ width: '9%' }}
                    className="p-2 text-slate-500 truncate"
                  >
                    {l.editorial}
                  </td>
                  <td style={{ width: '6%' }} className="p-2 text-slate-500">
                    {l.anyo_publicacion}
                  </td>
                  <td style={{ width: '4%' }} className="p-2 text-slate-500">
                    {l.paginas}
                  </td>
                  <td style={{ width: '9%' }} className="p-2 text-slate-500">
                    {l.isbn}
                  </td>
                  <td style={{ width: '6%' }} className="p-2 text-slate-500">
                    <span
                      className={`px-2 py-1 rounded-md text-[9px] font-black ${
                        l.estado === 'Disponible'
                          ? 'bg-green-100 text-green-600'
                          : l.estado === 'Prestado'
                            ? 'bg-orange-100 text-orange-600'
                            : l.estado === 'Extraviado'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {l.estado?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ width: '13%' }} className="p-2 text-slate-500">
                    {l.portada_img}
                  </td>
                  <td style={{ width: '7%' }} className="p-2 flex gap-1">
                    <button
                      onClick={() => setEditando(l)}
                      className="p-3 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleEliminar(l.id_libro)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL DE EDICIÓN */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-[#7F252E] text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest">
                Editar Libro #{editando.id_libro}
              </h3>
              <button onClick={() => setEditando(null)}>
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleUpdate}
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold"
                  value={editando.titulo}
                  onChange={(e) =>
                    setEditando({ ...editando, titulo: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Estado del Ejemplar
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border rounded-xl font-black text-[#7F252E]"
                  value={editando.estado}
                  onChange={(e) =>
                    setEditando({ ...editando, estado: e.target.value })
                  }
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Prestado">Prestado</option>
                  <option value="Extraviado">Extraviado</option>
                  <option value="No Disponible">No Disponible</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold uppercase text-xs hover:bg-red-700 transition-all"
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

export default GestionLibros;
