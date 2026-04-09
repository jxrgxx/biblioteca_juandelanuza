const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
  quiet: true,
});

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

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token no válido' });
    }
    req.user = decoded;
    next();
  });
}

app.get('/libros', (req, res) => {
  const { q, editorial, anyo, genero, paginas, sort, order, page } = req.query;

  const limite = 42;
  const paginaActual = parseInt(page) || 1;
  const saltar = (paginaActual - 1) * limite; //Offest

  let sql = 'select * from libro where 1=1';
  let params = [];

  if (q && q.trim() !== '') {
    sql += ' and (titulo like ? or autor like ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  if (editorial && editorial !== '') {
    sql += ' and editorial = ?';
    params.push(editorial);
  }

  if (anyo && anyo !== '') {
    if (anyo === '2020') {
      sql += ' and anyo_publicacion >= 2020';
    } else if (anyo === '2010') {
      sql += ' and anyo_publicacion between 2010 and 2019';
    } else if (anyo === 'antiguo') {
      sql += ' and anyo_publicacion < 1990';
    } else {
      sql += ' and anyo_publicacion between ? and ?';
      params.push(parseInt(anyo), parseInt(anyo) + 9);
    }
  }

  if (genero && genero !== '') {
    sql += ' and genero = ?';
    params.push(genero);
  }

  if (paginas && paginas !== '') {
    if (paginas === 'muy-corto') {
      sql += ' and paginas < 50';
    } else if (paginas === 'corto') {
      sql += ' and paginas between 50 and 100';
    } else if (paginas === 'estandar') {
      sql += ' and paginas between 101 and 300';
    } else if (paginas === 'largo') {
      sql += ' and paginas between 301 and 600';
    } else if (paginas === 'muy-largo') {
      sql += ' and paginas > 600';
    }
  }

  const columnasPermitidas = [
    'titulo',
    'editorial',
    'autor',
    'anyo_publicacion',
    'genero',
    'paginas',
  ];

  const direccionesPermitidas = ['ASC', 'DESC'];
  const campoOrden = columnasPermitidas.includes(sort) ? sort : 'titulo';
  const direccionOrden = direccionesPermitidas.includes(order) ? order : 'ASC';

  sql += ` order by ${campoOrden} ${direccionOrden}`;

  sql += ` limit ? offset ?`;
  params.push(limite, saltar);

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/generos', (req, res) => {
  const sql =
    'select distinct genero from libro where genero is not null and genero != "" order by genero asc';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    const lista = results.map((row) => row.genero);
    res.json(lista);
  });
});

app.get('/editoriales', (req, res) => {
  const sql =
    'select distinct editorial from libro where editorial is not null and editorial != "" order by editorial asc';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    const lista = results.map((row) => row.editorial);
    res.json(lista);
  });
});

app.get('/usuarios/buscar', verificarToken, (req, res) => {
  const correo = req.query.email;

  const sql =
    'select id_usuario, nombre, correo from usuario where correo = ? and rol = "alumno"';

  db.query(sql, [correo], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length > 0) {
      res.json({ success: true, usuario: results[0] });
    } else {
      res.json({ success: false, message: 'Alumno no encontrado' });
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

app.post('/login', loginLimiter, (req, res) => {
  const { correo, contrasenya } = req.body;

  const sql = 'select * from usuario where correo = ? and contrasenya = ?';

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

app.post('/prestamos', verificarToken, (req, res) => {
  const { id_libro, correo_alumno } = req.body;

  db.query(
    'select id_usuario, correo from usuario where correo = ?',
    [correo_alumno],
    (err, users) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: 'Error en el servidor' });
      if (users.length === 0)
        return res
          .status(404)
          .json({ success: false, message: 'El alumno no existe' });

      const id_usuario = users[0].id_usuario;

      db.query(
        'select titulo, estado from libro where id_libro = ?',
        [id_libro],
        (err, libros) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: 'Error al buscar libro' });
          if (libros.length === 0)
            return res
              .status(404)
              .json({ success: false, message: 'Libro no encontrado' });

          if (libros[0].estado !== 'Disponible') {
            return res.status(400).json({
              success: false,
              message: `El libro '${libros[0].titulo}' ya figura como ${libros[0].estado}.`,
            });
          }

          db.query(
            'select * from prestamo where id_libro = ? and devuelto = 0',
            [id_libro],
            (err, prestamosActivos) => {
              if (prestamosActivos.length > 0) {
                return res.status(400).json({
                  success: false,
                  message:
                    'Error crítico: Este libro tiene un préstamo pendiente de devolución en el historial.',
                });
              }

              const ahora = new Date();
              const limite = new Date();
              limite.setDate(ahora.getDate() + 15);

              const sqlInsert = `insert into prestamo (id_libro, id_usuario, fecha_inicio, fecha_limite, devuelto) values (?, ?, ?, ?, 0)`;

              db.query(
                sqlInsert,
                [id_libro, id_usuario, ahora, limite],
                (err) => {
                  if (err)
                    return res.status(500).json({
                      success: false,
                      message: 'Error al crear registro',
                    });

                  db.query(
                    'update libro set estado = "prestado" where id_libro = ?',
                    [id_libro],
                    (err) => {
                      if (err)
                        return res.status(500).json({
                          success: false,
                          message: 'Error al actualizar estado',
                        });

                      res.json({
                        success: true,
                        message: `¡Libro '${libros[0].titulo}' prestado con éxito!`,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

app.get('/libros/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'select * from libro where id_libro = ?';

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0)
      return res.status(404).json({ message: 'Libro no encontrado' });
    res.json(results[0]);
  });
});
