import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Footer from './components/Footer';
import Gestion from './pages/Gestion';
import LibroDetalle from './pages/LibroDetalle';

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
      <div className="min-h-screen felx flex-col bg-slate-50">
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route
              path="/"
              element={<Home user={user} onLogout={handleLogout} />}
            />

            <Route
              path="/login"
              element={
                !user ? (
                  <Login onLoginSuccess={handleLogin} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/gestion"
              element={
                user ? (
                  <Gestion user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route path="/libro/:id" element={<LibroDetalle />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
