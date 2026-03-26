import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function Login({ onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Cifrado de contraseña
      const passwordHashed = CryptoJS.SHA256(password.trim()).toString(CryptoJS.enc.Hex);

      const res = await axios.post('http://localhost:3001/login', {
        correo: correo,
        contrasenya: passwordHashed,
      });

      if (res.data.success) {
        onLoginSuccess(res.data);
        navigate('/dashboard');
      }
    } catch (err) {
      const mensajeError = err.response?.data?.message || 'Credenciales incorrectas';
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-4 font-sans bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/foto_entrada.jpg')" }}
    >
      {/* Capa de fondo oscura (Overlay) */}
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm"></div>

      {/* CONTENEDOR LOGIN */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white border-t-8 border-[#7F252E] shadow-2xl rounded-2xl">
        
        {/* LOGO Y TÍTULO */}
        <div className="mb-8 text-center">
          <img
            src="/juan_de_lanuza_logo.png"
            alt="Logo Colegio Juan de Lanuza"
            className="h-24 mx-auto mb-4"
          />
          <p className="font-lanuza font-medium text-[#7F252E] text-sm uppercase tracking-wider">
            Biblioteca Juan de Lanuza
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 text-slate-800">
          
          {/* CAMPO CORREO */}
          <div>
            <label className="block text-sm font-medium text-[#7F252E] font-lanuza mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full p-3 transition border outline-none border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-[#7F252E] focus:border-[#7F252E]"
              placeholder="tu_correo@juandelanuza.org"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div>
            <label className="block text-sm font-medium text-[#7F252E] font-lanuza mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-12 transition border outline-none border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-[#7F252E] focus:border-[#7F252E]"
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-slate-400 right-3 top-1/2 -translate-y-1/2 hover:text-[#7F252E] transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="flex justify-center pt-2">
              <p className="px-4 py-1 text-sm font-extrabold text-red-500 border border-red-100 shadow-sm animate-bounce bg-red-50 rounded-full">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* BOTÓN DE ENTRADA */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-4 mt-2 font-bold text-white shadow-lg rounded-xl flex items-center justify-center gap-2 transition transform active:scale-95 
              ${loading 
                ? 'bg-[#7F252E]/70 cursor-not-allowed' 
                : 'bg-[#7F252E] hover:bg-[#631d24] hover:scale-[1.02]'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                <span>Validando acceso...</span>
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;