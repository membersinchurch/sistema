// test-pg.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'mclRaposo2025@',
  database: 'membersinchurch',
  port: 5432
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('OK — Conectado ao Postgres com o Pool do Node!');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('ERRO Node->Postgres:', err.message || err);
    console.error(err);
    process.exit(1);
  }
})();
