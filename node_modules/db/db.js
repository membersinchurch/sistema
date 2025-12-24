const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFolder = path.resolve(__dirname, 'db');
const dbPath = path.resolve(dbFolder, 'database.db');

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
  }
});

module.exports = db;
