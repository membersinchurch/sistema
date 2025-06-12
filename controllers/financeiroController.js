const db = require('../db/db');
console.log(typeof db.get); // deve exibir: function


// Retorna o total de entradas (dízimos e ofertas) do administrador
async function getEntradaTotal(adminId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT SUM(valor) as total FROM entradas WHERE admin_id = ?', [adminId], (err, row) => {
      if (err) return reject(err);
      resolve(row.total || 0);
    });
  });
}

// Retorna o total de saídas (despesas) do administrador
async function getSaidaTotal(adminId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT SUM(valor) as total FROM saidas WHERE admin_id = ?', [adminId], (err, row) => {
      if (err) return reject(err);
      resolve(row.total || 0);
    });
  });
}

// Retorna as últimas entradas e saídas
async function getResumoFinanceiro(adminId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM entradas WHERE admin_id = ? ORDER BY data DESC LIMIT 5`,
      [adminId],
      (err, entradas) => {
        if (err) return reject(err);
        db.all(
          `SELECT * FROM saidas WHERE admin_id = ? ORDER BY data DESC LIMIT 5`,
          [adminId],
          (err2, saidas) => {
            if (err2) return reject(err2);
            resolve({ entradas, saidas });
          }
        );
      }
    );
  });
}

module.exports = {
  getEntradaTotal,
  getSaidaTotal,
  getResumoFinanceiro
};
