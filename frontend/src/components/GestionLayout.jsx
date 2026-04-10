import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ScanBarcode,
  Book,
  Users,
  MessageSquare,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

function GestionLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Préstamos', path: '/gestion', icon: <ScanBarcode size={18} /> },
    { label: 'Libros', path: '/gestion/libros', icon: <Book size={18} /> },
    { label: 'Usuarios', path: '/gestion/usuarios', icon: <Users size={18} /> },
    {
      label: 'Reseñas',
      path: '/gestion/resenyas',
      icon: <MessageSquare size={18} />,
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* BARRA DE NAVEGACIÓN DE GESTIÓN */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="w-full px-4 md:px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#7F252E] transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-black text-[#7F252E] uppercase tracking-tight font-lanuza">
              Panel de Gestión
            </h1>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all font-lanuza ${
                  location.pathname === tab.path
                    ? 'bg-white shadow-md text-[#7F252E]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all active:scale-95 font-lanuza shadow-sm"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* AQUÍ SE CARGAN LAS SUB-PÁGINAS */}
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

export default GestionLayout;
