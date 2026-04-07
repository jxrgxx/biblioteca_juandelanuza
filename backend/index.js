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
  max: 10,
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
  const { q, editorial, edad, genero, paginas, sort, order } = req.query;

  let sql = 'SELECT * FROM Libro WHERE 1=1';
  let params = [];

  if (q && q.trim() !== '') {
    sql += ' AND (titulo LIKE ? OR autor LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  if (editorial && editorial !== '') {
    sql += ' AND editorial = ?';
    params.push(editorial);
  }

  if (edad && edad !== '') {
    sql += ' AND clasificacion_edad <= ?';
    params.push(edad);
  }

  if (genero && genero !== '') {
    sql += ' AND genero = ?';
    params.push(genero);
  }

  if (paginas && paginas !== '') {
    if (paginas === 'muy-corto') {
      sql += ' AND paginas < 50';
    } else if (paginas === 'corto') {
      sql += ' AND paginas BETWEEN 50 AND 100';
    } else if (paginas === 'estandar') {
      sql += ' AND paginas BETWEEN 101 AND 300';
    } else if (paginas === 'largo') {
      sql += ' AND paginas BETWEEN 301 AND 600';
    } else if (paginas === 'muy-largo') {
      sql += ' AND paginas > 600';
    }
  }

  const columnasPermitidas = [
    'titulo',
    'editorial',
    'autor',
    'clasificacion_edad',
    'genero',
    'paginas',
  ];

  const direccionesPermitidas = ['ASC', 'DESC'];

  const campoOrden = columnasPermitidas.includes(sort) ? sort : 'titulo';
  const direccionOrden = direccionesPermitidas.includes(order) ? order : 'ASC';

  sql += ` ORDER BY ${campoOrden} ${direccionOrden}`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/generos', (req, res) => {
  const sql =
    'SELECT DISTINCT genero FROM Libro WHERE genero IS NOT NULL AND genero != "" ORDER BY genero ASC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    const lista = results.map((row) => row.genero);
    res.json(lista);
  });
});

app.get('/editoriales', (req, res) => {
  const sql =
    'SELECT DISTINCT editorial FROM Libro WHERE editorial IS NOT NULL AND editorial != "" ORDER BY editorial ASC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    const lista = results.map((row) => row.editorial);
    res.json(lista);
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

      const token = jwt.sign({ id: user.id }, SECRET_KEY, {
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
