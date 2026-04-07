import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_lanuza');

    if (savedUser && savedUser !== 'undefined') {
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

  useEffect(() => {
    if (!user) return;

    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);

      timer = setTimeout(
        () => {
          handleLogout();
          alert('Sesión cerrada por seguridad tras 10 minutos de inactividad.');
        },
        10 * 60 * 1000
      );
    };

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    eventos.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      eventos.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home user={user} onLogout={handleLogout} />}
        />

        <Route
          path="/login"
          element={
            !user ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/" />
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
