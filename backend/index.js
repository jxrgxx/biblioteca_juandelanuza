const path = require('path');
const multer = require('multer');
const fs = require('fs');

// --- CONFIGURACIÓN DE VARIABLES DE ENTORNO ---
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
  quiet: true,
});

const cors = require('cors');
const db = require('./db'); // Importa la conexión a la base de datos MariaDB
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit'); // Para evitar ataques de fuerza bruta
const helmet = require('helmet'); // Para proteger la app de vulnerabilidades web comunes
const express = require('express');
const SECRET_KEY = process.env.JWT_SECRET;

// Bloquea el inicio del servidor si falta la clave de seguridad
if (!SECRET_KEY) {
  console.error(
    '❌ ERROR: No se ha encontrado la JWT_SECRET en el archivo .env'
  );
  process.exit(1);
}

const app = express();

// --- MIDDLEWARES (Configuraciones de seguridad y datos) ---
app.use(cors()); // Permite que el frontend se comunique con el backend
app.use(express.json()); // Permite recibir datos en formato JSON (en los POST y PUT)
app.use(helmet()); // Añade cabeceras de seguridad

// Limita a 10 intentos de login cada 10 minutos para evitar hackeos
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiados intentos. Inténtalo de nuevo en 10 minutos.',
  },
});

// FUNCIÓN PARA VERIFICAR SI EL USUARIO ESTÁ LOGUEADO (JWT)
function verificarToken(req, res, next) {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del "Bearer [TOKEN]"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token no válido' });
    }
    req.user = decoded; // Guarda los datos del usuario en la petición
    next(); // Continúa hacia el endpoint
  });
}

// --- ENDPOINTS DE LIBROS ---

// Obtener libros con filtros, buscador, ordenación y paginación
app.get('/libros', (req, res) => {
  const {
    q,
    id_libro,
    titulo,
    editorial,
    autor,
    anyo,
    anyo_exacto,
    genero,
    paginas,
    isbn,
    portada_img,
    estado,
    sort,
    order,
    page,
    limit,
  } = req.query;

  const limite = parseInt(limit) || 42; // Si no mandan límite, por defecto 42
  const paginaActual = parseInt(page) || 1;
  const saltar = (paginaActual - 1) * limite; // Calcula cuántos registros ignorar para la página actual

  let sql = 'select * from libro where 1=1';
  let params = [];

  if (id_libro) {
    sql += ' and id_libro = ?';
    params.push(id_libro);
  }
  if (isbn) {
    sql += ' and isbn like ?';
    params.push(`%${isbn}%`);
  }
  if (estado) {
    sql += ' and estado = ?';
    params.push(estado);
  }
  if (autor) {
    sql += ' and autor like ?';
    params.push(`%${autor}%`);
  }
  if (titulo) {
    sql += ' and titulo like ?';
    params.push(`%${titulo}%`);
  }
  if (portada_img) {
    sql += ' and portada_img like ?';
    params.push(`%${portada_img}%`);
  }

  // Buscador de texto
  if (q && q.trim() !== '') {
    sql += ' and (titulo like ? or autor like ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  if (editorial && editorial !== '') {
    sql += ' and editorial = ?';
    params.push(editorial);
  }

  if (anyo_exacto) {
    sql += ' and anyo_publicacion = ?';
    params.push(parseInt(anyo_exacto));
  }

  // Filtro por año de publicación (rangos)
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

  // Filtro por género
  if (genero && genero !== '') {
    sql += ' and genero = ?';
    params.push(genero);
  }

  // Filtro por cantidad de páginas
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

  // Seguridad: Solo permitimos ordenar por columnas reales
  const columnasPermitidas = [
    'id_libro',
    'titulo',
    'editorial',
    'autor',
    'anyo_publicacion',
    'genero',
    'paginas',
    'isbn',
    'estado',
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

// Crear libro (Solo usuarios autenticados)
app.post('/libros', verificarToken, (req, res) => {
  const {
    titulo,
    editorial,
    autor,
    anyo_publicacion,
    genero,
    paginas,
    isbn,
    portada_img,
  } = req.body;

  const sql =
    'INSERT INTO libro (titulo, editorial, autor, anyo_publicacion, genero, paginas, isbn, portada_img, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Disponible")';

  db.query(
    sql,
    [
      titulo,
      editorial,
      autor,
      anyo_publicacion,
      genero,
      paginas,
      isbn,
      portada_img,
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({
        success: true,
        message: 'Libro creado correctamente',
        id: result.insertId,
      });
    }
  );
});

// Editar libro
app.put('/libros/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    editorial,
    autor,
    anyo_publicacion,
    genero,
    paginas,
    isbn,
    portada_img,
    estado,
  } = req.body;
  const sql =
    'UPDATE libro SET titulo=?, editorial=?, autor=?, anyo_publicacion=?, genero=?, paginas=?, isbn=?, portada_img=?, estado=? WHERE id_libro=?';

  db.query(
    sql,
    [
      titulo,
      editorial,
      autor,
      anyo_publicacion,
      genero,
      paginas,
      isbn,
      portada_img,
      estado,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: 'Libro actualizado' });
    }
  );
});

// Borrar libro
app.delete('/libros/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM libro WHERE id_libro = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true, message: 'Libro eliminado' });
  });
});

// Listas auxiliares para los filtros del frontend
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// --- SISTEMA DE AUTENTICACIÓN ---
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

// --- GESTIÓN DE PRÉSTAMOS ---

// Crear préstamo
app.post('/prestamos', verificarToken, (req, res) => {
  const { id_libro, correo_alumno } = req.body;

  // 1. ¿Existe el alumno?
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

      // 2. ¿Existe el libro y está libre?
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
              message: `El libro '${libros[0].titulo}' figura como ${libros[0].estado}.`,
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

              // 3. Crear registro de préstamo
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

                  // 4. Actualizar estado del libro a "Prestado"
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

// Historial detallado con nombres de libros y correos de alumnos
app.get('/prestamos-detallados', verificarToken, (req, res) => {
  const { sort, order, searchField, searchValue } = req.query;

  const mapColumnas = {
    id: 'p.id_prestamo',
    libro: 'l.titulo',
    alumno: 'u.correo',
    inicio: 'p.fecha_inicio',
    limite: 'p.fecha_limite',
    devolucion: 'p.fecha_devolucion',
    estado: 'p.devuelto',
  };

  const mapFiltros = {
    id_prestamo: 'p.id_prestamo',
    titulo_libro: 'l.titulo',
    usuario: 'u.correo',
    fecha_inicio: 'p.fecha_inicio',
    fecha_limite: 'p.fecha_limite',
    fecha_devolucion: 'p.fecha_devolucion',
    estado: 'p.devuelto',
  };

  let sql = `
    SELECT p.*, l.titulo as titulo_libro, u.correo as correo_usuario 
    FROM prestamo p
    JOIN libro l ON p.id_libro = l.id_libro
    JOIN usuario u ON p.id_usuario = u.id_usuario
    WHERE 1=1
  `;

  let params = [];

  // Buscador del historial con validación de existencia de campo
  if (searchField && searchValue && mapFiltros[searchField]) {
    sql += ` AND ${mapFiltros[searchField]} LIKE ?`;
    params.push(`%${searchValue}%`);
  }

  const campoOrden = mapColumnas[sort] || 'p.fecha_inicio';
  const direccionOrden = order === 'ASC' || order === 'DESC' ? order : 'DESC';

  sql += ` ORDER BY ${campoOrden} ${direccionOrden}`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error SQL:', err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// Actualizar préstamo
app.delete('/prestamos/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM prestamo WHERE id_prestamo = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true, message: 'Registro eliminado' });
  });
});

app.put('/prestamos/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  const {
    id_libro,
    id_usuario,
    fecha_inicio,
    fecha_limite,
    fecha_devolucion,
    devuelto,
  } = req.body;

  const sql = `
    UPDATE prestamo 
    SET id_libro = ?, id_usuario = ?, fecha_inicio = ?, fecha_limite = ?, fecha_devolucion = ?, devuelto = ? 
    WHERE id_prestamo = ?
  `;

  db.query(
    sql,
    [
      id_libro,
      id_usuario,
      fecha_inicio,
      fecha_limite,
      fecha_devolucion,
      devuelto,
      id,
    ],

    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: 'Error al actualizar' });
      }

      // Sincroniza el estado del libro: Si se marcó como devuelto, el libro vuelve a estar "Disponible"
      const nuevoEstado = devuelto ? 'Disponible' : 'Prestado';
      db.query(
        'UPDATE libro SET estado = ? WHERE id_libro = ?',
        [nuevoEstado, id_libro],
        () => {
          res.json({
            success: true,
            message: 'Préstamo y estado de libro actualizados',
          });
        }
      );
    }
  );
});

// OBTENER DETALLES DE UN LIBRO INDIVIDUAL (Se usa para la página de Ficha del Libro)
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

// Configuración de dónde y cómo se guardan las fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nombreDeseado = req.body.nombreArchivoCustom || 'temp';
    const extension = path.extname(file.originalname);
    cb(null, nombreDeseado + extension);
  },
});

const upload = multer({ storage: storage });

// NUEVO ENDPOINT PARA CREAR LIBRO CON FOTO
app.post(
  '/libros-con-foto',
  verificarToken,
  upload.single('imagen'),
  (req, res) => {
    const {
      titulo,
      editorial,
      autor,
      anyo_publicacion,
      genero,
      paginas,
      isbn,
    } = req.body;

    //nombre archivo final
    const portada_img = req.file ? req.file.filename : 'default.png';

    const sql =
      'INSERT INTO libro (titulo, editorial, autor, anyo_publicacion, genero, paginas, isbn, portada_img, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Disponible")';

    db.query(
      sql,
      [
        titulo,
        editorial,
        autor,
        anyo_publicacion,
        genero,
        paginas,
        isbn,
        portada_img,
      ],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'Libro y portada guardados' });
      }
    );
  }
);
