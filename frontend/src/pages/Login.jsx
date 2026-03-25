import { useState } from 'react'
import axios from 'axios'
import  { useNavigate } from 'react-router-dom'
import CryptoJS from 'crypto-js'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function Login({ onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('');
    try {
      const passwordHassed = CryptoJS.SHA256(password.trim()).toString(CryptoJS.enc.Hex)

      const res = await axios.post('http://localhost:3001/login', {
        correo: correo,
        contrasenya: passwordHassed
      })
      
      if (res.data.success) {
        onLoginSuccess(res.data)
        navigate('/dashboard')
      }
    } catch (err) {
      const mensajeError = err.response?.data?.message || 'Credenciales incorrectas';
      setError(mensajeError);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-indigo-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">Biblioteca Lanuza</h1>
          <p className="text-gray-500 mt-2 italic text-sm">Colegio Juan de Lanuza</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {/* CAMPO CORREO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-semibold">Correo</label>
            <input 
              type="email" 
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="tu_correo@juandelanuza.org" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-semibold">Contraseña</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"} 
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="••••••••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex justify-center pt-2">
              <p className="text-red-500 text-sm font-extrabold animate-bounce bg-red-50 px-4 py-1 rounded-full border border-red-100 shadow-sm">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* BOTÓN ENTRAR */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-indigo-600 text-white p-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700 hover:scale-105'}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Validando...</span>
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login