require('dotenv').config({ quiet: true });

const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  console.error(
    '❌ ERROR: No se ha encontrado la JWT_SECRET en el archivo .env'
  );
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Demasiados intentos. Inténtalo de nuevo en 10 minutos.',
  },
});

function verificarToken(req, res, next) {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Error al verificar JWT:', err.message);
      return res.status(403).json({ error: 'Token no válido' });
    }
    req.user = decoded;
    next();
  });
}

app.get('/libros', (req, res) => {
  const busqueda = req.query.q ? req.query.q.trim() : '';

  let sql;
  let params = [];

  if (busqueda === '') {
    sql = 'SELECT * FROM Libro ORDER BY titulo ASC';
  } else {
    sql = `
      SELECT * FROM Libro 
      WHERE titulo LIKE ?
      OR autor LIKE ?
      or genero LIKE ?
      ORDER BY titulo ASC
    `;
    const valor = `%${busqueda}%`;
    params = [valor, valor, valor];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error en SQL:', err);
      return res.status(500).json({ error: 'Error al consultar libros' });
    }
    res.json(results);
  });
});

app.post('/libros', verificarToken, (req, res) => {});
app.post('/prestamos', verificarToken, (req, res) => {});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

app.post('/login', loginLimiter, (req, res) => {
  const { correo, contrasenya } = req.body;
  const sql = 'SELECT * FROM Usuario WHERE correo = ? AND contrasenya = ?';

  db.query(sql, [correo, contrasenya], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error en el servidor' });
    } else if (results.length > 0) {
      const user = results[0];

      const token = jwt.sign({ id: user.id_usuario }, SECRET_KEY, {
        expiresIn: '8h',
      });

      delete user.contrasenya;
      res.json({ success: true, token, user });
    } else {
      res
        .status(401)
        .json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});
