const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',         // Ex: 'postgres'
  host: 'localhost',           // Ou o IP do servidor PostgreSQL
  database: 'membersinchurch',       // Ex: 'igreja_db'
  password: 'mclRaposo2025@',
  port: 5432,                  // Porta padrão do PostgreSQL
});

module.exports = pool;
