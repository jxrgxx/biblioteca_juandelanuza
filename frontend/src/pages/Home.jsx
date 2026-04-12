import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LibroCard from '../components/LibroCard';
import { Search, X, ArrowDownAZ, ArrowUpAZ, LogOut } from 'lucide-react';

function Home({ user, onLogout }) {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [generos, setGeneros] = useState([]);
  const [genero, setGenero] = useState('');
  const [anyo, setAnyo] = useState('');
  const [editoriales, setEditoriales] = useState([]);
  const [editorial, setEditorial] = useState('');
  const [rangoPaginas, setRangoPaginas] = useState('');
  const [sortField, setSortField] = useState('titulo');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [pagina, setPagina] = useState(1);
  const [hayMasLibros, setHayMasLibros] = useState(true);

  const cargarLibros = async (numPagina = 1) => {
    if (numPagina === 1) {
      setLoading(true);
      setPagina(1);
    }

    const token = localStorage.getItem('token_lanuza');
    try {
      const res = await axios.get(`/api/libros`, {
        params: {
          q: busqueda,
          genero: genero,
          anyo: anyo,
          editorial: editorial,
          paginas: rangoPaginas,
          sort: sortField,
          order: sortOrder,
          page: numPagina,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (numPagina === 1) {
        setLibros(res.data);
      } else {
        setLibros((prev) => [...prev, ...res.data]);
      }

      setHayMasLibros(res.data.length === 42);
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
    const timerCarga = async (numPag = 1) => {
      await cargarLibros(numPag);
    };

    const timeoutId = setTimeout(() => {
      timerCarga(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [busqueda, genero, anyo, editorial, rangoPaginas, sortField, sortOrder]);

  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const resG = await axios.get('/api/generos');
        const resE = await axios.get('/api/editoriales');
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
    setAnyo('');
    setEditorial('');
    setRangoPaginas('');
  };

  const handleCargarMas = () => {
    const siguientePagina = pagina + 1;
    setPagina(siguientePagina);
    cargarLibros(siguientePagina);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Superior */}
      <nav className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-xl font-medium text-[#7F252E] uppercase tracking-tighter font-lanuza leading-none">
                BIBLIOTECA
              </h1>
              <p className="text-[10px] text-slate-400 font-lanuza uppercase tracking-widest">
                Colegio Juan de Lanuza
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-5">
                {/* NUEVO BOTÓN PARA IR AL MOSTRADOR */}
                <button
                  onClick={() => navigate('/gestion')}
                  className="bg-[#7F252E] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#631d24] transition-all border border-[#7F252E] flex items-center gap-2 shadow-md shadow-red-900/10"
                >
                  <span className="text-lg">⚡</span>
                  Gestión
                </button>
                <div className="text-right hidden sm:block border-r pr-5 border-slate-200">
                  <p className="text-sm font-bold text-slate-900">
                    {user.correo}
                  </p>
                  <p className="text-xs font-bold text-[#7F252E] uppercase">
                    {user.rol}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all active:scale-95 font-lanuza shadow-sm"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-[#7F252E] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#631d24] transition-all shadow-lg shadow-red-900/10 active:scale-95 font-lanuza"
              >
                Acceso Personal
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="w-full px-4 md:px-10 py-8">
        {/* 1. CABECERA */}
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
        </div>

        {/* 2. BARRA DE HERRAMIENTAS (Buscador, Filtros y Ordenación) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 mb-10 flex flex-col xl:flex-row gap-6 items-center">
          {/* BUSCADOR */}
          <div className="relative w-full xl:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar título o autor..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-1 focus:ring-[#7F252E] focus:border-[#7F252E] transition-all font-lanuza text-sm text-slate-700"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                onClick={handleLimpiarBusqueda}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="hidden xl:block w-px h-8 bg-slate-200"></div>

          {/* GRUPO DE FILTROS Y ORDENACIÓN */}
          <div className="flex flex-wrap items-center gap-4 w-full">
            <span className="text-[10px] font-medium text-black uppercase tracking-widest font-lanuza">
              Filtros:
            </span>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-black uppercase tracking-tight font-lanuza">
                Género
              </label>
              <select
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-xs text-slate-600 font-lanuza cursor-pointer"
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

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-black uppercase tracking-tight font-lanuza">
                Editorial
              </label>
              <select
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-xs text-slate-600 font-lanuza cursor-pointer"
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

            {/* SELECTOR DE AÑO */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-black uppercase tracking-tight font-lanuza">
                Año
              </label>
              <select
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-xs text-slate-600 font-lanuza cursor-pointer"
                value={anyo}
                onChange={(e) => setAnyo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="2020">Desde 2020</option>
                <option value="2010">2010 - 2019</option>
                <option value="2000">2000 - 2009</option>
                <option value="1990">1990 - 1999</option>
                <option value="antiguo">Anteriores a 1990</option>
              </select>
            </div>

            <div className="hidden xl:block w-px h-8 bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-black uppercase tracking-widest font-lanuza mr-1">
                Orden:
              </span>
              <select
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#7F252E] text-xs text-slate-600 font-lanuza cursor-pointer"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="titulo">Título</option>
                <option value="autor">Autor</option>
                <option value="editorial">Editorial</option>
                <option value="anyo_publicacion">Año publicación</option>
                <option value="paginas">Páginas</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
                }
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-[#7F252E] shadow-sm"
              >
                {sortOrder === 'ASC' ? (
                  <ArrowDownAZ size={18} />
                ) : (
                  <ArrowUpAZ size={18} />
                )}
              </button>
            </div>

            {(busqueda || genero || anyo || editorial) && (
              <button
                onClick={handleLimpiarBusqueda}
                className="ml-auto text-[10px] font-bold text-[#7F252E] uppercase tracking-wider hover:text-[#631d24] flex items-center gap-1 group font-lanuza border border-[#7F252E]/20 px-3 py-2 rounded-xl bg-red-50/50"
              >
                <X
                  size={12}
                  className="group-hover:rotate-90 transition-transform"
                />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* 3. LISTADO DE LIBROS CON CARGAR MÁS */}
        {loading && pagina === 1 ? (
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
                  No hay resultados para "
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
              <>
                {/* GRID DE LIBROS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-6">
                  {libros.map((libro) => (
                    <LibroCard key={libro.id_libro} libro={libro} user={user} />
                  ))}
                </div>

                {/* BOTÓN CARGAR MÁS */}
                {hayMasLibros && (
                  <div className="flex justify-center mt-16 mb-20">
                    <button
                      onClick={handleCargarMas}
                      disabled={loading}
                      className={`bg-white text-[#7F252E] border-2 border-[#7F252E] px-10 py-3 rounded-2xl font-medium transition-all transform active:scale-95 shadow-md font-lanuza flex items-center gap-3
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#7F252E] hover:text-white'}`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Cargando...</span>
                        </>
                      ) : (
                        'Cargar más libros'
                      )}
                    </button>
                  </div>
                )}

                {/* MENSAJE FINAL */}
                {!hayMasLibros && libros.length >= 42 && (
                  <div className="text-center mt-12 mb-20">
                    <p className="text-slate-400 font-lanuza italic">
                      Has llegado al final del catálogo
                    </p>
                  </div>
                )}
              </>
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
