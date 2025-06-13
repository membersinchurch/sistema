<<<<<<< HEAD
const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('Conexão bem-sucedida. Horário atual:', res.rows[0]);
  }

  pool.end();
});
=======
const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('Conexão bem-sucedida. Horário atual:', res.rows[0]);
  }

  pool.end();
});
>>>>>>> 6fa9314911287a35326b119a0567039e1d8357f9
