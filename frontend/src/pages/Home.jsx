import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LibroCard from '../components/LibroCard';
import { Search, X } from 'lucide-react';

function Home({ user, onLogout }) {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [generos, setGeneros] = useState([]);
  const [genero, setGenero] = useState('');
  const [edad, setEdad] = useState('');
  const [editoriales, setEditoriales] = useState([]);
  const [editorial, setEditorial] = useState('');
  const [rangoPaginas, setRangoPaginas] = useState('');

  const cargarLibros = async (textoBusqueda = busqueda) => {
    setLoading(true);
    const token = localStorage.getItem('token_lanuza');
    try {
      const res = await axios.get(
        `http://localhost:3001/libros?q=${textoBusqueda}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setLibros(res.data);
    } catch (error) {
      console.error('Error cargando libros', error);
      if (
        user &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cargarLibros = async () => {
      setLoading(true);
      const token = localStorage.getItem('token_lanuza');
      try {
        const res = await axios.get(`http://localhost:3001/libros`, {
          params: {
            q: busqueda,
            genero: genero,
            edad: edad,
            editorial: editorial,
            paginas: rangoPaginas,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setLibros(res.data);
      } catch (error) {
        console.error(error);
        if (
          user &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          onLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(cargarLibros, 300);
    return () => clearTimeout(timeoutId);
  }, [busqueda, genero, edad, editorial, rangoPaginas]);

  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const resG = await axios.get('http://localhost:3001/generos');
        const resE = await axios.get('http://localhost:3001/editoriales');
        setGeneros(resG.data);
        setEditoriales(resE.data);
      } catch (error) {
        console.error('Error cargando filtros adaptativos', error);
      }
    };
    cargarFiltros();
  }, []);

  const handleLimpiarBusqueda = () => {
    setBusqueda('');
    setGenero('');
    setEdad('');
    setEditorial('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Superior */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-xl font-medium text-[#7F252E] uppercase tracking-tighter font-lanuza leading-none">
                Lanuza Libros
              </h1>
              <p className="text-[10px] text-slate-400 font-lanuza uppercase tracking-widest">
                Biblioteca Escolar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="text-right hidden sm:block border-r pr-5 border-slate-200">
                  <p className="text-sm font-bold text-slate-900">
                    {user.correo_usuario}
                  </p>
                  <p className="text-xs font-bold text-[#7F252E] uppercase">
                    {user.rol_usuario}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors border border-red-100 font-lanuza"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-[#7F252E] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#631d24] transition-all shadow-lg shadow-red-900/10 active:scale-95 font-lanuza"
              >
                Acceso Personal
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="w-full px-4 md:px-10 py-8">
        {/* 1. CABECERA: Título y Botón de Acción */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-medium font-lanuza text-[#7F252E] tracking-tight">
              {user ? 'Panel de Gestión' : 'Catálogo de Libros'}
            </h2>
            <p className="text-slate-500 text-lg font-lanuza mt-1">
              {user
                ? 'Administra préstamos, devoluciones y stock.'
                : 'Explora nuestra colección y selecciona tu próxima lectura.'}
            </p>
          </div>
          {user && (
            <button className="bg-[#7F252E] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-900/10 hover:bg-[#631d24] transition transform hover:-translate-y-1 active:scale-95 font-lanuza">
              + Nuevo Libro
            </button>
          )}
        </div>

        {/* 2. BARRA DE HERRAMIENTAS (Buscador y Filtros) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 mb-10 flex flex-col xl:flex-row gap-6 items-center">
          {/* Buscador */}
          <div className="relative w-full xl:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Escribe título o autor..."
              className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-1 focus:ring-[#7F252E] focus:border-[#7F252E] transition-all font-lanuza text-slate-700"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                onClick={handleLimpiarBusqueda}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Separador visual en escritorio */}
          <div className="hidden xl:block w-px h-8 bg-slate-200"></div>

          {/* Grupo de Selectores */}
          <div className="flex flex-wrap items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-black uppercase tracking-widest font-lanuza">
                Filtros:
              </span>
            </div>

            {/* SELECTOR DE GÉNERO */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="text-xs font-medium text-black uppercase tracking-tight font-lanuza">
                Género
              </label>
              <select
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-sm text-slate-600 font-lanuza cursor-pointer hover:bg-slate-100 transition-colors"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
              >
                <option value="">Todos</option>
                {generos.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden xl:block w-px h-8 bg-slate-200"></div>

            {/* SELECTOR DE EDITORIAL ADAPTATIVO */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="text-xs font-medium text-black uppercase tracking-tight font-lanuza ml-2">
                Editorial
              </label>
              <select
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-sm text-slate-600 font-lanuza cursor-pointer hover:bg-slate-100 transition-colors"
                value={editorial}
                onChange={(e) => setEditorial(e.target.value)}
              >
                <option value="">Todas</option>
                {editoriales.map((ed) => (
                  <option key={ed} value={ed}>
                    {ed}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden xl:block w-px h-8 bg-slate-200"></div>

            {/* SELECTOR DE EDAD */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="text-xs font-medium text-black uppercase tracking-tight font-lanuza ml-2">
                Edad
              </label>
              <select
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-sm text-slate-600 font-lanuza cursor-pointer hover:bg-slate-100 transition-colors"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="6">Hasta 6 años</option>
                <option value="10">Hasta 10 años</option>
                <option value="14">Hasta 14 años</option>
                <option value="18">Hasta 18 años</option>
              </select>
            </div>

            <div className="hidden xl:block w-px h-8 bg-slate-200"></div>

            {/* SELECTOR DE PÁGINAS */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="text-xs font-medium text-black uppercase tracking-tight font-lanuza ml-2">
                Páginas
              </label>
              <select
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-sm text-slate-600 font-lanuza cursor-pointer hover:bg-slate-100 transition-colors shadow-sm"
                value={rangoPaginas}
                onChange={(e) => setRangoPaginas(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="muy-corto">Muy corto (&lt; 50p)</option>
                <option value="corto">Corto (50-100p)</option>
                <option value="estandar">Estándar (100-300p)</option>
                <option value="largo">Largo (300-600p)</option>
                <option value="muy-largo">Muy largo (&gt; 600p)</option>
              </select>
            </div>

            {/* BOTÓN LIMPIAR FILTROS */}
            {(busqueda || genero || edad || editorial) && (
              <button
                onClick={handleLimpiarBusqueda}
                className="ml-auto text-xs font-bold text-[#7F252E] uppercase tracking-wider hover:text-[#631d24] flex items-center gap-1 group font-lanuza"
              >
                <X
                  size={14}
                  className="group-hover:rotate-90 transition-transform"
                />
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* 3. LISTADO DE LIBROS */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <LoaderComponent />
            <p className="text-slate-400 font-bold animate-pulse font-lanuza">
              Cargando biblioteca...
            </p>
          </div>
        ) : (
          <>
            {libros.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-300">
                <p className="text-slate-400 text-xl font-lanuza">
                  No se han encontrado resultados para "
                  <span className="text-slate-600 font-bold">{busqueda}</span>"
                </p>
                <button
                  onClick={handleLimpiarBusqueda}
                  className="mt-4 text-[#7F252E] font-bold underline font-lanuza hover:text-[#631d24]"
                >
                  Ver todos los libros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-6">
                {libros.map((libro) => (
                  <LibroCard key={libro.id_libro} libro={libro} user={user} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function LoaderComponent() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-[#7F252E] rounded-full animate-spin"></div>
      <span className="absolute text-xl">📖</span>
    </div>
  );
}

export default Home;
