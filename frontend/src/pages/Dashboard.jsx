import { useEffect, useState } from 'react';
import axios from 'axios';
import LibroCard from '../components/LibroCard';

function Dashboard({ user, onLogout }) {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarLibros = async () => {
      const token = localStorage.getItem('token_lanuza');
      try {
        const res = await axios.get('http://localhost:3001/libros', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setLibros(res.data);
      } catch (error) {
        console.error("Error cargando libros", error);
        if(error.response?.status === 401 || error.response?.status === 403) {
          onLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    cargarLibros();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Superior */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Lanuza Libros</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{user.correo_usuario}</p>
              <p className="text-xs text-slate-500">{user.rol_usuario}</p>
            </div>
            <button 
              onClick={onLogout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Panel de Control</h2>
            <p className="text-slate-500">Gestiona el inventario y los préstamos activos</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition transform hover:-translate-y-1">
            + Nuevo Libro
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {libros.map(libro => (
              <LibroCard key={libro.id_libro} libro={libro} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;