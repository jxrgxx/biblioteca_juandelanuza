import { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
  UserPlus,
  Trash2,
  Edit,
  Search,
  ShieldCheck,
  User as UserIcon,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [editando, setEditando] = useState(null);

  // Estados para ordenación y búsqueda (Igual que en Préstamos)
  const [sortConfig, setSortConfig] = useState({
    key: 'id_usuario',
    direction: 'ASC',
  });
  const [searchField, setSearchField] = useState('correo');
  const [searchValue, setSearchValue] = useState('');

  const [nuevo, setNuevo] = useState({
    correo: '',
    contrasenya: '',
    rol: 'alumno',
  });

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get('/api/usuarios', {
        params: {
          sort: sortConfig.key,
          order: sortConfig.direction,
          searchField: searchField,
          searchValue: searchValue,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarUsuarios();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [sortConfig, searchField, searchValue]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usuarioParaEnviar = {
        ...nuevo,
        contrasenya: CryptoJS.SHA256(nuevo.contrasenya.trim()).toString(
          CryptoJS.enc.Hex
        ),
      };

      await axios.post('/api/usuarios', usuarioParaEnviar, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });

      setMensaje({
        tipo: 'success',
        texto: 'Usuario registrado correctamente',
      });

      setNuevo({ correo: '', contrasenya: '', rol: 'alumno' });
      cargarUsuarios();
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar usuario' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const datosEnvio = { ...editando };

      if (datosEnvio.contrasenya && datosEnvio.contrasenya.trim() !== '') {
        datosEnvio.contrasenya = CryptoJS.SHA256(
          datosEnvio.contrasenya.trim()
        ).toString(CryptoJS.enc.Hex);
      } else {
        delete datosEnvio.contrasenya;
      }

      await axios.put(`/api/usuarios/${editando.id_usuario}`, datosEnvio, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
        },
      });

      setEditando(null);
      setMensaje({ tipo: 'success', texto: 'Usuario actualizado' });
      cargarUsuarios();
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario permanentemente?')) return;
    await axios.delete(`/api/usuarios/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token_lanuza')}`,
      },
    });
    cargarUsuarios();
  };

  const usuariosProcesados = usuarios
    .filter((u) => {
      const valor = String(u[searchField] || '').toLowerCase();
      return valor.includes(searchValue.toLowerCase());
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'ASC' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ASC' ? 1 : -1;
      return 0;
    });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'ASC'
          ? 'DESC'
          : 'ASC',
    });
  };

  return (
    <div className="w-full px-4 md:px-10 py-6 font-lanuza animate-in fade-in duration-500">
      {/* 1. ALTA Y BUSCADOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* FORMULARIO ALTA SLIM */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-xl font-black text-[#7F252E] mb-6 uppercase flex items-center gap-2">
            <UserPlus size={22} /> Nuevo Usuario
          </h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              autoComplete="username"
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#7F252E] text-sm"
              value={nuevo.correo}
              onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              autoComplete="new-password"
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#7F252E] text-sm"
              value={nuevo.contrasenya}
              onChange={(e) =>
                setNuevo({ ...nuevo, contrasenya: e.target.value })
              }
              required
            />
            <select
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-xs cursor-pointer"
              value={nuevo.rol}
              onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}
            >
              <option value="alumno">Alumno</option>
              <option value="admin">Admin</option>
              <option value="profesor">Profesor</option>
              <option value="biblioteca">Biblioteca</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7F252E] text-white py-4 rounded-2xl font-black hover:bg-[#631d24] transition-all"
            >
              {loading ? 'REGISTRANDO...' : 'AÑADIR USUARIO'}
            </button>
          </form>
        </div>

        {/* BUSCADOR DINÁMICO */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-[#7F252E]" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Buscador de Usuarios
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <select
              className="bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs outline-none"
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setSearchValue('');
              }}
            >
              <option value="correo">Correo Electrónico</option>
              <option value="id_usuario">ID Usuario</option>
              <option value="rol">Rol</option>
            </select>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Buscar por ${searchField}...`}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#7F252E] font-medium text-slate-700"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase tracking-tight">
            Usuarios
          </h2>
        </div>

        {/* CONTENEDOR CON SCROLL VERTICAL Y HORIZONTAL */}
        <div className="overflow-x-auto max-h-[600px]">
          <table
            className="w-max min-w-full text-left"
            style={{ tableLayout: 'fixed' }}
          >
            {/* CABECERA */}
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="text-[10px] uppercase tracking-widest border-b border-slate-200">
                {[
                  { label: 'ID', key: 'id_usuario', width: '10%' },
                  { label: 'Correo Electrónico', key: 'correo', width: '50%' },
                  { label: 'Rol ', key: 'rol', width: '25%' },
                ].map((col) => {
                  const activa = sortConfig.key === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{ width: col.width }}
                      className="p-2 cursor-pointer hover:bg-slate-200 transition-colors group select-none text-slate-500 border"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`transition-colors ${activa ? 'text-[#7F252E] font-black' : ''}`}
                        >
                          {col.label}
                        </span>
                        <span className="flex items-center">
                          {activa ? (
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
                <th
                  className="p-4 border border-slate-200 text-slate-500"
                  style={{ width: '15%' }}
                >
                  Acciones
                </th>
              </tr>
            </thead>

            {/* CUERPO */}
            <tbody className="overflow-y-auto max-h-[600px] bg-white scrollbar-thin">
              {usuariosProcesados.map((u) => (
                <tr
                  key={u.id_usuario}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4 text-xs text-slate-400 font-mono">
                    #{u.id_usuario}
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700">
                    {u.correo}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 w-fit border ${
                        u.rol === 'Admin'
                          ? 'bg-purple-50 text-purple-600 border-purple-100'
                          : u.rol === 'Profesor'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : u.rol === 'Biblioteca'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}
                    >
                      {u.rol === 'admin' ? (
                        <ShieldCheck size={12} />
                      ) : u.rol === 'biblioteca' ? (
                        <BookOpen size={12} />
                      ) : (
                        <UserIcon size={12} />
                      )}
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditando(u)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-xl transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(u.id_usuario)}
                        className="p-2 text-red-400 hover:bg-red-100 rounded-xl transition"
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

      {/* MODAL DE EDICIÓN */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-[#7F252E] text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-sm">
                Editar Usuario #{editando.id_usuario}
              </h3>
              <button
                onClick={() => setEditando(null)}
                className="hover:rotate-90 transition-transform"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-[#7F252E]"
                  value={editando.correo}
                  autoComplete="new-user"
                  onChange={(e) =>
                    setEditando({ ...editando, correo: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Cambiar contraseña (Opcional)
                </label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para no cambiar"
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-[#7F252E]"
                  onChange={(e) =>
                    setEditando({ ...editando, contrasenya: e.target.value })
                  }
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                  Rol del Sistema
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border rounded-xl font-black outline-none"
                  value={editando.rol}
                  onChange={(e) =>
                    setEditando({ ...editando, rol: e.target.value })
                  }
                >
                  <option value="Alumno">Alumno</option>
                  <option value="Admin">Admin</option>
                  <option value="Profesor">Profesor</option>
                  <option value="Biblioteca">Biblioteca</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#7F252E] text-white py-4 rounded-2xl font-black uppercase hover:bg-[#631d24] transition-all"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold uppercase text-xs hover:bg-slate-200 transition-all"
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

export default GestionUsuarios;
