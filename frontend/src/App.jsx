import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_lanuza');

    if(savedUser && savedUser !== 'undefined') {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    } 

    return null;
  });

  const handleLogin = (data) => {
    setUser(data.user);
    localStorage.setItem('user_lanuza', JSON.stringify(data.user));
    localStorage.setItem('token_lanuza', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_lanuza');
    localStorage.removeItem('token_lanuza');

  };

  return (
    <Router>
      <Routes>
        {/* RUTA DE LOGIN */}
        <Route 
          path="/login" 
          element={!user ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/dashboard" />} 
        />

        {/* RUTA DE DASHBOARD (Protegida) */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* REDIRECCIÓN POR DEFECTO: Si pones cualquier otra cosa, te manda al login o dashboard según si estás logueado */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;