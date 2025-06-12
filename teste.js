const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('Conexão bem-sucedida. Horário atual:', res.rows[0]);
  }

  pool.end();
});
