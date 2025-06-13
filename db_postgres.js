<<<<<<< HEAD
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',         // Ex: 'postgres'
  host: 'localhost',           // Ou o IP do servidor PostgreSQL
  database: 'membersinchurch',       // Ex: 'igreja_db'
  password: 'mclRaposo2025@',
  port: 5432,                  // Porta padrão do PostgreSQL
});

module.exports = pool;
=======
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',         // Ex: 'postgres'
  host: 'localhost',           // Ou o IP do servidor PostgreSQL
  database: 'membersinchurch',       // Ex: 'igreja_db'
  password: 'mclRaposo2025@',
  port: 5432,                  // Porta padrão do PostgreSQL
});

module.exports = pool;
>>>>>>> 6fa9314911287a35326b119a0567039e1d8357f9
