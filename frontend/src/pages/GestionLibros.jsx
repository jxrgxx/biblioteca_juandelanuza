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
    portada_img: '',
  });

  const inputRef = useRef(null);

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [modoCaptura, setModoCaptura] = useState('archivo');

  const cargarLibros = async () => {
    try {
      const params = {
        sort: sortConfig.key,
        order: sortConfig.direction,
        page: 1,
        limit: 1000,
      };

      if (searchValue.trim() !== '') {
        switch (searchField) {
          case 'id':
            params.id_libro = searchValue;
            break;
          case 'titulo':
            params.titulo = searchValue;
            break;
          case 'autor':
            params.autor = searchValue;
            break;
          case 'editorial':
            params.editorial = searchValue;
            break;
          case 'genero':
            params.genero = searchValue;
            break;
          case 'isbn':
            params.isbn = searchValue;
            break;
          case 'estado':
            params.estado = searchValue;
            break;
          case 'portada_img':
            params.portada_img = searchValue;
            break;
          case 'anyo_exacto':
            params.anyo_exacto = searchValue;
            break;
          case 'todo':
            params.q = searchValue;
            break;
          default:
            params.q = searchValue;
        }
      }

      const res = await axios.get('/api/libros', { params: params });
      setLibros(res.data);
    } catch (error) {
      console.error('Error cargando libros:', error);
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

    const formData = new FormData();
    formData.append('titulo', nuevo.titulo);
    formData.append('autor', nuevo.autor);
    formData.append('editorial', nuevo.editorial);
    formData.append('anyo_publicacion', nuevo.anyo_publicacion);
    formData.append('genero', nuevo.genero);
    formData.append('paginas', nuevo.paginas);
    formData.append('isbn', nuevo.isbn);
    formData.append('nombreArchivoCustom', nuevo.portada_img);

    if (archivoSeleccionado) {
      formData.append('imagen', archivoSeleccionado);
    }

    try {
      const res = await axios.post('/api/libros-con-foto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });

      if (res.data.success) {
        setMensaje({
          tipo: 'success',
          texto: 'Libro y foto guardados correctamente',
        });
        setNuevo({
          titulo: '',
          autor: '',
          editorial: '',
          anyo_publicacion: '',
          genero: '',
          paginas: '',
          isbn: '',
          portada_img: '',
        });
        setArchivoSeleccionado(null);
        cargarLibros();
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al subir libro o imagen' });
    } finally {
      setLoading(false);
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
      <div className="flex flex-col gap-6 mb-8">
        {/* PANEL DE INSERCIÓN */}
        <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#7F252E]/10 p-2 rounded-lg">
              <BookPlus size={24} className="text-[#7F252E]" />
            </div>
            <h2 className="text-lg font-black text-[#7F252E] uppercase tracking-tighter">
              Nuevo Libro
            </h2>
          </div>

          <form onSubmit={handleCrear} className="space-y-4">
            {/* FILA 1: Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Título
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ej: El Quijote"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#7F252E] focus:bg-white transition-all text-sm"
                  value={nuevo.titulo}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, titulo: e.target.value })
                  }
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Autor
                </label>
                <input
                  type="text"
                  placeholder="Nombre del autor"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#7F252E] focus:bg-white transition-all text-sm"
                  value={nuevo.autor}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, autor: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Género
                </label>
                <input
                  type="text"
                  placeholder="Novela, Historia..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#7F252E] focus:bg-white transition-all text-sm"
                  value={nuevo.genero}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, genero: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Editorial
                </label>
                <input
                  type="text"
                  placeholder="Planeta, Alfaguara..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#7F252E] focus:bg-white transition-all text-sm"
                  value={nuevo.editorial}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, editorial: e.target.value })
                  }
                />
              </div>
            </div>

            {/* FILA 2: Datos técnicos, Foto y Botón */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Año (1 col) */}
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Año
                </label>
                <input
                  type="number"
                  placeholder="2024"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#7F252E]"
                  value={nuevo.anyo_publicacion}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, anyo_publicacion: e.target.value })
                  }
                />
              </div>

              {/* Páginas */}
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Págs
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#7F252E]"
                  value={nuevo.paginas}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, paginas: e.target.value })
                  }
                />
              </div>

              {/* ISBN */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  ISBN
                </label>
                <input
                  type="text"
                  placeholder="978-..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#7F252E]"
                  value={nuevo.isbn}
                  onChange={(e) => setNuevo({ ...nuevo, isbn: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block text-ellipsis overflow-hidden whitespace-nowrap">
                  Nombre Archivo Foto
                </label>
                <input
                  type="text"
                  placeholder="nombre-foto.jpg"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#7F252E]"
                  value={nuevo.portada_img}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, portada_img: e.target.value })
                  }
                />
              </div>

              {/* Subida de Archivo */}
              <div className="md:col-span-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-2 flex flex-col gap-1">
                <div className="flex justify-between items-center px-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture={
                      modoCaptura === 'camara' ? 'environment' : undefined
                    }
                    className="w-full text-[10px] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#7F252E] file:text-white cursor-pointer"
                    onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                  />
                  <select
                    className="text-[9px] font-bold bg-white border rounded px-1 py-0.5 outline-none"
                    value={modoCaptura}
                    onChange={(e) => setModoCaptura(e.target.value)}
                  >
                    <option value="archivo">Archivo</option>
                    <option value="camara">Cámara</option>
                  </select>
                </div>
              </div>

              {/* Botón de Registro */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7F252E] text-white py-3.5 rounded-2xl font-black hover:bg-[#631d24] transition-all shadow-lg shadow-[#7F252E]/20 text-sm"
                >
                  {loading ? 'GUARDANDO...' : 'REGISTRAR LIBRO'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* BUSCADOR */}
        <div className="w-full bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 min-w-max">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <Search size={20} className="text-[#7F252E]" />
            </div>
            <div>
              <h2 className="text-slate-800 text-[10px] font-black uppercase tracking-[0.2em]">
                Filtros de
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase">
                Búsqueda rápida
              </p>
            </div>
          </div>

          <div className="flex flex-1 gap-3 w-full">
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 p-4 rounded-2xl font-bold text-xs outline-none focus:border-[#7F252E] transition-all cursor-pointer"
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setSearchValue('');
              }}
            >
              <option value="titulo">Título</option>
              <option value="autor">Autor</option>
              <option value="id">ID Libro</option>
              <option value="editorial">Editorial</option>
              <option value="genero">Género</option>
              <option value="anyo_exacto">Año Publicación</option>
              <option value="isbn">ISBN</option>
              <option value="portada_img">Nombre archivo foto</option>
              <option value="estado">Estado</option>
            </select>

            {/* Lógica Condicional: Checkboxes para Estado o Input para el resto */}
            {searchField === 'estado' ? (
              <div className="flex-1 flex flex-wrap gap-4 items-center bg-slate-50 border border-slate-200 px-6 py-2 rounded-2xl shadow-inner">
                {['disponible', 'prestado', 'no disponible', 'extraviado'].map(
                  (opcion) => (
                    <label
                      key={opcion}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-[#7F252E] checked:border-[#7F252E] transition-all cursor-pointer"
                          checked={searchValue === opcion}
                          onChange={() =>
                            setSearchValue(searchValue === opcion ? '' : opcion)
                          }
                        />
                        <svg
                          className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity ml-0.5 pointer-events-none"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-xs font-bold uppercase text-slate-600 group-hover:text-[#7F252E] transition-colors">
                        {opcion}
                      </span>
                    </label>
                  )
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder={`Buscar por ${searchField}...`}
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#7F252E] text-slate-700 placeholder:text-slate-400 text-sm transition-all shadow-inner"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            )}
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

      {/* 3. MODAL DE EDICIÓN TOTAL */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-[#7F252E] text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest">
                Editar Libro #{editando.id_libro}
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
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* TÍTULO */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E]"
                  value={editando.titulo}
                  onChange={(e) =>
                    setEditando({ ...editando, titulo: e.target.value })
                  }
                  required
                />
              </div>

              {/* AUTOR Y EDITORIAL */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Autor
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E]"
                  value={editando.autor}
                  onChange={(e) =>
                    setEditando({ ...editando, autor: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Editorial
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E]"
                  value={editando.editorial}
                  onChange={(e) =>
                    setEditando({ ...editando, editorial: e.target.value })
                  }
                />
              </div>

              {/* GÉNERO Y AÑO */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Género
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E]"
                  value={editando.genero}
                  onChange={(e) =>
                    setEditando({ ...editando, genero: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Año Publicación
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E]"
                  value={editando.anyo_publicacion}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      anyo_publicacion: e.target.value,
                    })
                  }
                />
              </div>

              {/* PÁGINAS E ISBN */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Páginas
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E]"
                  value={editando.paginas}
                  onChange={(e) =>
                    setEditando({ ...editando, paginas: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  ISBN
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E] font-mono"
                  value={editando.isbn}
                  onChange={(e) =>
                    setEditando({ ...editando, isbn: e.target.value })
                  }
                />
              </div>

              {/* NOMBRE ARCHIVO PORTADA */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-blue-500">
                  Nombre de imagen
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl font-bold outline-none"
                  value={editando.portada_img}
                  onChange={(e) =>
                    setEditando({ ...editando, portada_img: e.target.value })
                  }
                />
              </div>

              {/* ESTADO (Ocupa 2 columnas) */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Estado del Ejemplar
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border rounded-xl font-black text-[#7F252E] outline-none"
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

              {/* BOTONES */}
              <div className="md:col-span-2 flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-900/20"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-bold uppercase text-xs hover:bg-red-100 transition-all border border-red-100"
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
