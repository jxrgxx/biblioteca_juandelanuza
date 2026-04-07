const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'biblioteca_juandelanuza',
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a la DB: ' + err.stack);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

module.exports = connection;
