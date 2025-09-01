
// gerarHash.js
const bcrypt = require('bcryptjs');

const novaSenha = '011525'; // 🛠️ Substitua pela nova senha desejada

bcrypt.hash(novaSenha, 10, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
  } else {
    console.log('Hash gerado:', hash);
  }
});


