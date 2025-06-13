
const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Pool } = require('pg');
const app = express();
const cron = require('node-cron');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');







// Configuração do banco PostgreSQL
const pgPool = new Pool({
  connectionString: 'postgresql://postgres:bFDBiRAwIPmtQqtkRBDfwfZpFHvqaViS@metro.proxy.rlwy.net:50378/railway',
  ssl: {
    rejectUnauthorized: false
  }
});



// Primeiro declara storage

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'), // <- CORRIGIDO
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
        console.log("Foto recebida:", req.file);

  }
});

const upload = multer({ storage });


// Configurações gerais
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(bodyParser.urlencoded({ extended: true }));




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'chave-secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

function verificarAdmin(req, res, next) {
  if (req.session.adminId) {
    return next();
  } else {
    return res.redirect('/');
  }
}


function obterAdminId(req) {
  if (req.session && req.session.adminId) {
    return req.session.adminId;
  } else if (req.session && req.session.usuarioAdminId) {
    return req.session.usuarioAdminId;
  }
  return null;
}

function verificarSessao(req, res, next) {
  if (req.session && (req.session.adminId || (req.session.usuario && req.session.usuario.adminId))) {
    next();
  } else {
    res.redirect('/login');
  }
}

function verificarAutenticacao(req, res, next) {
  if (req.session.adminId || req.session.usuarioId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

function verificarUsuarioAutenticado(req, res, next) {
  if (req.session && req.session.usuarioId) {
    next();
  } else {
    res.redirect('/login_usuario');
  }
}



function verificarQualquerAutenticado(req, res, next) {
  if (req.session.adminId || req.session.usuarioId) {
    next();
  } else {
    res.redirect('/login');
  }
}



app.get('/', (req, res) => {
  res.render('login', { error: null });
});
app.get('/login_usuario', (req, res) => {
  res.render('login_usuario') // ou o nome do seu arquivo EJS de login do usuário
});



// Login do admin

app.post('/login', async (req, res) => {
  

  const email = req.body.email.trim();
  const senha = req.body.senha.trim();

  try {
    const result = await pgPool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];

      const match = await bcrypt.compare(senha, admin.senha);
      if (match) {
        req.session.adminId = admin.id;
        return res.redirect('/dashboard');
      }
    }

    res.render('login', { error: 'Credenciais inválidas' });
  } catch (err) {
    console.error('Erro ao conectar com o PostgreSQL:', err);
    res.render('login', { error: 'Erro interno no servidor' });
  }
});

// Rota para exibir a lista de membros
app.get('/lista_membros', verificarAutenticacao, async (req, res) => {
     const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  if (!adminId) return res.redirect('/login');

  try {
    const result = await pgPool.query(`
      SELECT membros.*, ministerios.nome AS ministerio_nome
      FROM membros
      LEFT JOIN ministerios ON membros.ministerio_id = ministerios.id
      WHERE membros.admin_id = $1
    `, [adminId]); // <- Aqui usa a variável correta

    const membros = result.rows;

    res.render('lista_membros', { membros });
  } catch (err) {
    console.error('Erro ao buscar membros:', err);
    res.status(500).send('Erro ao buscar membros');
  }
});





// Cadastro do ministério
app.post('/ministerios', (req, res) => {
  const { nome, descricao } = req.body;
  const sql = 'INSERT INTO ministerios (nome, descricao) VALUES (?, ?)';
  pgPool.query(sql, [nome, descricao], function (err) {
    if (err) {
      console.error(err);
      return res.send('Erro ao salvar ministério.');
    }
    res.redirect('/ministerios');
  });
});

app.get('/ministerios', (req, res) => {
  const adminId = obterAdminId(req);


  pgPool.query('SELECT * FROM ministerios', (err, rows) => {
    if (err) {
      console.error(err);
      return res.send('Erro ao buscar ministérios.');
    }
    res.render('ministerios', { ministerios: rows });
  });
});

app.get('/cadastrar-ministerio', (req, res) => {
  res.render('cadastrar_ministerio');
});



app.post('/lista_membros', verificarAutenticacao, async (req, res) => {
  const { nome, data_nascimento, sexo, telefone, email } = req.body;
  const adminId = req.session.adminId || req.session.usuarioId;

  try {
    const query = `
      INSERT INTO membros (nome, data_nascimento, sexo, telefone, email, admin_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pgPool.query(query, [nome, data_nascimento, sexo, telefone, email, adminId]);

    res.redirect('/lista_membros');
  } catch (err) {
    console.error('Erro ao cadastrar membro:', err);
    res.status(500).send('Erro ao cadastrar membro.');
  }
});

// Rota do dashboard - acessível tanto por administradores quanto usuários vinculados

app.get('/dashboard', verificarAutenticacao, async (req, res) => { 
     const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  if (!adminId) return res.redirect('/login');

 try {
    // Buscar membros
    const resultadoMembros = await pgPool.query('SELECT * FROM membros WHERE admin_id = $1', [adminId]);
    const membros = resultadoMembros.rows;
    const totalMembros = membros.length;

    // Buscar lançamentos
    const resultadoLancamentos = await pgPool.query('SELECT * FROM lancamentos WHERE admin_id = $1', [adminId]);
    const lancamentos = resultadoLancamentos.rows;

    // Totais de entradas e saídas
    const resultadoTotais = await pgPool.query(`
      SELECT 
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) AS total_saidas
      FROM lancamentos
      WHERE admin_id = $1
    `, [adminId]);

    const entradas = resultadoTotais.rows[0].total_entradas || 0;
    const saidas = resultadoTotais.rows[0].total_saidas || 0;
    const total = entradas - saidas;

    // Membros por mês de nascimento
    const mesResult = await pgPool.query(`
      SELECT EXTRACT(MONTH FROM data_nascimento) AS mes, COUNT(*) 
      FROM membros 
      WHERE admin_id = $1
      GROUP BY mes ORDER BY mes
    `, [adminId]);

    const membrosPorMes = Array(12).fill(0);
    mesResult.rows.forEach(row => {
      membrosPorMes[parseInt(row.mes) - 1] = parseInt(row.count);
    });

    // Faixa etária
    const idadeResult = await pgPool.query(`
      SELECT 
        CASE
          WHEN idade <= 18 THEN '0-18'
          WHEN idade BETWEEN 19 AND 30 THEN '19-30'
          WHEN idade BETWEEN 31 AND 50 THEN '31-50'
          ELSE '51+'
        END AS faixa,
        COUNT(*) 
      FROM (
        SELECT DATE_PART('year', AGE(data_nascimento)) AS idade 
        FROM membros 
        WHERE admin_id = $1
      ) AS idades
      GROUP BY faixa
    `, [adminId]);

    const faixaEtaria = { '0-18': 0, '19-30': 0, '31-50': 0, '51+': 0 };
    idadeResult.rows.forEach(row => {
      faixaEtaria[row.faixa] = parseInt(row.count);
    });

    const faixaEtariaArray = [
      faixaEtaria['0-18'],
      faixaEtaria['19-30'],
      faixaEtaria['31-50'],
      faixaEtaria['51+']
    ];

    // Por sexo
    const sexoResult = await pgPool.query(`
      SELECT sexo, COUNT(*) 
      FROM membros 
      WHERE admin_id = $1
      GROUP BY sexo
    `, [adminId]);

    // Contagem por sexo (corrigida)
    const porSexo = await pgPool.query(`
      SELECT 
        SUM(CASE WHEN sexo = 'Masculino' THEN 1 ELSE 0 END) AS masculino,
        SUM(CASE WHEN sexo = 'Feminino' THEN 1 ELSE 0 END) AS feminino
      FROM membros
      WHERE admin_id = $1
    `, [adminId]);

      console.log('porSexo:', porSexo.rows[0]);


    // Renderiza a página com todos os dados
    res.render('dashboard', {
      membros,
      totalMembros,
      lancamentos,
      total: total.toFixed(2),
      membrosPorMes,
      faixaEtaria: faixaEtariaArray,
      porSexo: porSexo.rows[0]
    });

  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
    res.status(500).send('Erro interno no servidor');
  }
});


app.get('/financas', async (req, res) => {
  if (!req.session.adminId) {
    return res.status(403).send('Acesso negado: apenas administradores podem acessar esta página.');
  }

  const adminId = req.session.adminId;
  const { dataInicio, dataFim } = req.query;

  try {
    let query = `SELECT * FROM lancamentos WHERE admin_id = $1`;
    const params = [adminId];

    if (dataInicio && dataFim) {
      query += ` AND data BETWEEN $2 AND $3 ORDER BY data DESC`;
      params.push(dataInicio, dataFim);
    } else {
      query += ` ORDER BY data DESC`;
    }

    const result = await pgPool.query(query, params);
    const lancamentos = result.rows;

    // Calcular totais
    let totalEntradas = 0;
    let totalSaidas = 0;

    lancamentos.forEach(l => {
      if (l.tipo.toLowerCase() === 'entrada') {
        totalEntradas += parseFloat(l.valor);
      } else if (l.tipo.toLowerCase() === 'saída' || l.tipo.toLowerCase() === 'saida') {
        totalSaidas += parseFloat(l.valor);
      }
    });

    const saldoAtual = totalEntradas - totalSaidas;

    res.render('financas', {
      lancamentos,
      totalEntradas,
      totalSaidas,
      saldoAtual
    });

  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error);
    res.status(500).send('Erro ao carregar a página de finanças');
  }
});


app.post('/financas/lancamento', async (req, res) => {
  if (!req.session.adminId) {
    console.log('Admin não está logado. Sessão:', req.session);
    return res.status(401).send('Não autorizado');
  }

  const { tipo, valor, descricao, categoria, forma_pagamento, data } = req.body;
  const adminId = req.session.adminId;

  try {
    // 1. Buscar maior id existente
    const result = await pgPool.query('SELECT MAX(id) AS maxId FROM lancamentos');
    const maxId = result.rows[0].maxid || 0;
    const nextId = maxId + 1;

    // 2. Inserir com id gerado
    const query = `
      INSERT INTO lancamentos 
      (id, admin_id, tipo, valor, descricao, categoria, forma_pagamento, data) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [nextId, adminId, tipo, valor, descricao, categoria, forma_pagamento, data];

    await pgPool.query(query, values);

    res.redirect('/financas');

  } catch (err) {
    console.error('Erro ao inserir lançamento no PostgreSQL:', err);
    return res.status(500).send('Erro ao salvar lançamento');
  }
});


app.get('/financas/exportar/pdf', async (req, res) => {
  const adminId = req.session.adminId;

  try {
    const { rows: lancamentos } = await pgPool.query(
      'SELECT * FROM lancamentos WHERE admin_id = $1 ORDER BY data DESC',
      [adminId]
    );

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio_financeiro.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Relatório Financeiro', { align: 'center' });
    doc.moveDown();

    lancamentos.forEach(l => {
      const dataFormatada = moment(l.data).format('DD/MM/YYYY');
      const valorFormatado = typeof l.valor === 'number' ? l.valor.toFixed(2) : '0.00';

      doc
        .fontSize(12)
        .text(`Data: ${dataFormatada}`)
        .text(`Tipo: ${l.tipo}`)
        .text(`Categoria: ${l.categoria}`)
        .text(`Forma de Pagamento: ${l.forma_pagamento}`)
        .text(`Valor: R$ ${valorFormatado}`)
        .text(`Observação: ${l.descricao || '---'}`)
        .moveDown();
    });

    doc.end();

  } catch (err) {
    console.error('Erro ao gerar PDF financeiro:', err);
    res.status(500).send('Erro ao gerar relatório financeiro.');
  }
});




app.get("/exportar/csv", verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId;

  try {
    const { rows: membros } = await pgPool.query(
      "SELECT nome, email, data_nascimento, funcao, telefone, sexo FROM membros WHERE admin_id = $1",
      [adminId]
    );

    if (membros.length === 0) {
      return res.send("Nenhum membro encontrado para exportar.");
    }

    const header = "Nome,Email,Data de Nascimento,Função,Telefone,Sexo\n";

    const rows = membros.map(m => {
      const dataFormatada = new Date(m.data_nascimento).toLocaleDateString("pt-BR");
      return `"${m.nome}","${m.email}","${dataFormatada}","${m.funcao || ''}","${m.telefone || ''}","${m.sexo || ''}"`;
    }).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=membros.csv");
    res.send(header + rows);
  } catch (error) {
    console.error("Erro ao gerar CSV:", error);
    res.status(500).send("Erro ao gerar CSV.");
  }
});


// Exportar PDF
app.get('/exportar/pdf', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId;

  try {
    const { rows } = await pgPool.query(
      'SELECT nome, sexo, data_nascimento, telefone, email, bairro, cidade FROM membros WHERE admin_id = $1',
      [adminId]
    );

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'public', 'relatorio_membros.pdf');
    const writeStream = fs.createWriteStream(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=membros.pdf');

    doc.pipe(writeStream);

    doc.fontSize(18).text('Relatório de Membros', { align: 'center' });
    doc.moveDown();

    rows.forEach(membro => {
      const dataFormatada = new Date(membro.data_nascimento).toLocaleDateString('pt-BR');
      doc
        .fontSize(12)
        .text(`Nome: ${membro.nome}`)
        .text(`Sexo: ${membro.sexo || ''}`)
        .text(`Data de Nascimento: ${dataFormatada}`)
        .text(`Telefone: ${membro.telefone || ''}`)
        .text(`Email: ${membro.email || ''}`)
        .text(`Bairro: ${membro.bairro || ''}`)
        .text(`Cidade: ${membro.cidade || ''}`)
        .text('--------------------------');
    });

    doc.end();

    writeStream.on('finish', () => {
      res.download(filePath, 'relatorio_membros.pdf', err => {
        if (err) {
          console.error('Erro ao fazer download do PDF:', err);
          res.status(500).send('Erro ao enviar o PDF');
        } else {
          // Opcional: remover o arquivo após download
          fs.unlink(filePath, () => {});
        }
      });
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).send('Erro ao gerar PDF.');
  }
});

//Rota para pagina cadastro de membros
app.get('/cadastro_membros', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;

  try {
    const resultado = await pgPool.query(
      'SELECT id, nome FROM ministerios WHERE admin_id = $1',
      [adminId]
    );

    res.render('cadastro_membros', {
      ministerios: resultado.rows,
      mensagem: null,
      valores: {} // para manter compatibilidade com o formulário
    });
  } catch (err) {
    console.error("Erro ao buscar ministérios:", err);
    res.render('cadastro_membros', {
      ministerios: [],
      mensagem: "Erro ao carregar ministérios",
      valores: {}
    });
  }
});
// Rota POST de cadastro de membro
// rota para cadastro
app.post("/cadastro_membros", verificarAutenticacao, upload.single("foto"), async (req, res) => {
       const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  const {
    nome,
    ministerio,
    sexo,
    data_nascimento,
    telefone,
    email,
    capturedImage
  } = req.body;

  let caminhoFoto = null;

  // Se veio arquivo via upload tradicional
  if (req.file) {
    caminhoFoto = "/uploads/" + req.file.filename;
    console.log("Foto via upload:", caminhoFoto);
  }
  // Se veio imagem capturada pela câmera (base64)
  else if (capturedImage && capturedImage.startsWith("data:image/")) {
    // Converter base64 para arquivo e salvar
    const base64Data = capturedImage.replace(/^data:image\/png;base64,/, "");
    const nomeArquivo = `foto_${Date.now()}.png`;
    const caminhoFisico = path.join(__dirname, "public", "uploads", nomeArquivo);
    const caminhoRelativo = "/uploads/" + nomeArquivo;

    fs.writeFileSync(caminhoFisico, base64Data, "base64");
    caminhoFoto = caminhoRelativo;
    console.log("Foto via câmera:", caminhoFoto);
  } else {
    console.log("Nenhuma foto enviada.");
  }

  console.log("Ministério selecionado:", ministerio);

  try {
    await pgPool.query(
      "INSERT INTO membros (nome, ministerio_id, sexo, data_nascimento, telefone, email, foto, admin_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [nome, ministerio || null, sexo, data_nascimento, telefone, email, caminhoFoto, adminId]
    );
    res.redirect("/lista_membros");
  } catch (error) {
    console.error("Erro ao cadastrar membro:", error);
    console.error(error.stack)
    res.send("Erro ao cadastrar membro.");
    }
});

app.get('/cadastro', async (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/');
  }

  try {
    const usuarios = await pgPool.query('SELECT * FROM usuarios WHERE admin_id = $1', [req.session.adminId]);
    res.render('cadastro', {
      mensagem: null,
      usuarios: usuarios.rows,
      usuarioParaEditar: null // ← adicionamos isso!
    });
  } catch (erro) {
    console.error('Erro ao buscar usuários:', erro);
    res.render('cadastro', {
      mensagem: { tipo: 'danger', texto: 'Erro ao carregar usuários.' },
      usuarios: [],
      usuarioParaEditar: null
    });
  }
});





app.post('/cadastro', async (req, res) => {
  const { nome, email, telefone, data_nascimento, senha } = req.body;
  const adminId = req.session.adminId;

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const query = `
      INSERT INTO usuarios (nome, email, telefone, data_nascimento, senha, admin_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [nome, email, telefone, data_nascimento, senhaCriptografada, adminId];
    const result = await pgPool.query(query, values);
    const novoUsuarioId = result.rows[0].id;

    const mensagem = {
      tipo: 'success',
      texto: `Usuário cadastrado com sucesso! ID: ${novoUsuarioId}`
    };

    // 🔥 Buscar usuários novamente após cadastro
    const usuariosResult = await pgPool.query(
      'SELECT id, nome, email, telefone, data_nascimento FROM usuarios WHERE admin_id = $1 ORDER BY id DESC',
      [adminId]
    );
    const usuarios = usuariosResult.rows;

    res.render('cadastro', { mensagem, usuarios });

  } catch (error) {
    console.error('Erro no cadastro:', error);

    let erroTexto = 'Erro ao cadastrar usuário!';
    if (error.code === '23505') {
      erroTexto = 'Este e-mail já está cadastrado!';
    }

    const mensagem = { tipo: 'danger', texto: erroTexto };

    // 🔥 Também garantir que `usuarios` exista mesmo em caso de erro
    const usuariosResult = await pgPool.query(
      'SELECT id, nome, email, telefone, data_nascimento FROM usuarios WHERE admin_id = $1 ORDER BY id DESC',
      [adminId]
    );
    const usuarios = usuariosResult.rows;

    res.render('cadastro', { mensagem, usuarios });
  }
});

app.get('/editar-usuario/:id', async (req, res) => {
  const { id } = req.params;
  const adminId = req.session.adminId;

  try {
    const usuario = await pgPool.query(
      'SELECT * FROM usuarios WHERE id = $1 AND admin_id = $2',
      [id, adminId]
    );

    const usuarios = await pgPool.query(
      'SELECT * FROM usuarios WHERE admin_id = $1',
      [adminId]
    );

    if (usuario.rows.length === 0) {
      return res.render('cadastro', {
        mensagem: { tipo: 'danger', texto: 'Usuário não encontrado.' },
        usuarios: usuarios.rows,
        usuarioParaEditar: null
      });
    }

    res.render('cadastro', {
      mensagem: null,
      usuarios: usuarios.rows,
      usuarioParaEditar: usuario.rows[0]
    });

  } catch (erro) {
    console.error('Erro ao carregar usuário:', erro);
    res.render('cadastro', {
      mensagem: { tipo: 'danger', texto: 'Erro ao carregar usuário.' },
      usuarios: [],
      usuarioParaEditar: null
    });
  }
});





app.get('/excluir-usuario/:id', async (req, res) => {
  const { id } = req.params;
  const adminId = req.session.adminId;

  try {
    await pgPool.query(
      'DELETE FROM usuarios WHERE id = $1 AND admin_id = $2',
      [id, adminId]
    );

    res.redirect('/cadastro');

  } catch (erro) {
    console.error('Erro ao excluir usuário:', erro);
    res.render('cadastro', {
      mensagem: { tipo: 'danger', texto: 'Erro ao excluir usuário.' },
      usuarios: [],
      usuarioParaEditar: null
    });
  }
});






//Rota protegida
app.get('/usuario/dashboard', verificarAutenticacao, (req, res) => {
    const adminId = req.session.adminId || req.session.usuarioAdminId;
    const usuarioId = req.session.usuarioId;


  pgPool.query('SELECT * FROM usuarios WHERE id = $1', [usuarioId], (err, usuario) => {
    if (err || !usuario) {
      return res.redirect('/usuario/login');
    }
    res.render('usuario_dashboard', { usuario });
  });
});

app.get('/usuarios', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;

    if (!req.session.admin_id) {
        return res.redirect('/login');
    }


    try {
        const result = await pgPool.query('SELECT id, nome, email FROM usuarios WHERE admin_id = $1', [adminId]);
        const usuarios = result.rows;

        res.render('usuarios', { usuarios });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro ao buscar usuários.');
    }
});


app.post('/usuarios', verificarAutenticacao, async (req, res) => {
    const adminId = req.session.adminId || req.session.usuarioAdminId;

  const { nome, data_nascimento, telefone, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.render('usuarios', { usuarios: [], mensagem: 'Preencha todos os campos!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);

    await pgPool.query(
      'INSERT INTO usuarios (nome, data_nascimento, telefone, email, senha, admin_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [nome, data_nascimento, telefone, email, hashedPassword, adminId]
    );

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('usuarios', { usuarios: [], mensagem: 'Erro ao cadastrar usuário.' });
  }
});

app.post('/atualizar-usuario/:id', async (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/');
  }

  const usuarioId = req.params.id;
  const { nome, email, telefone, data_nascimento, senha } = req.body;

  try {
    await pgPool.query(
      `UPDATE usuarios 
       SET nome = $1, email = $2, telefone = $3, data_nascimento = $4, senha = $5 
       WHERE id = $6 AND admin_id = $7`,
      [nome, email, telefone, data_nascimento, senha, usuarioId, req.session.adminId]
    );

    const usuariosAtualizados = await pgPool.query(
      'SELECT * FROM usuarios WHERE admin_id = $1',
      [req.session.adminId]
    );

    res.render('cadastro', {
      mensagem: { tipo: 'success', texto: 'Usuário atualizado com sucesso!' },
      usuarios: usuariosAtualizados.rows,
      usuarioParaEditar: null
    });

  } catch (erro) {
    console.error('Erro ao atualizar usuário:', erro);
    const usuariosAtualizados = await pgPool.query(
      'SELECT * FROM usuarios WHERE admin_id = $1',
      [req.session.adminId]
    );

    res.render('cadastro', {
      mensagem: { tipo: 'danger', texto: 'Erro ao atualizar usuário.' },
      usuarios: usuariosAtualizados.rows,
      usuarioParaEditar: null
    });
  }
});




// Login do usuário
app.post('/login_usuario', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pgPool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.render('login_usuario', { error: 'Usuário não encontrado' });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.render('login_usuario', { error: 'Senha incorreta' });
    }

    // ✅ Login bem-sucedido
    req.session.usuarioId = usuario.id;
    req.session.usuarioAdminId = usuario.admin_id;
    return res.redirect('/dashboard'); // ✅ return para encerrar a rota

  } catch (err) {
    console.error('Erro no login do usuário:', err);
    return res.status(500).send('Erro interno no servidor');
  }
});


//Rota para o usuário listar os membros
app.get('/usuario/membros', verificarUsuarioAutenticado, (req, res) => {
  const adminId = req.session.adminId;

  pgPool.query('SELECT * FROM membros WHERE admin_id = $1', [adminId], (err, membros) => {
    if (err) {
      console.error('Erro ao buscar membros:', err);
      return res.status(500).send('Erro ao buscar membros.');
    }

    res.render('dashboard', {
      membros,
      mensagem: null,
      admin: null,
      usuario: { nome: req.session.userNome, email: req.session.userEmail }
    });
  });
});


// Sair
app.get("/logout", verificarAutenticacao, (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Servidor funcionando!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// ⏰ Agendamento diário às 8h
cron.schedule('0 8 * * *', async () => {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const dataAlvo = amanha.toISOString().split('T')[0];

  pgPool.query(`SELECT * FROM eventos WHERE data_inicio = $1`, [dataAlvo], async (err, rows) => {
    if (err) {
      console.error('Erro ao buscar eventos:', err);
      return;
    }

    for (const evento of rows) {
      await enviarEmailNotificacao(evento);
    }
  });
});

async function enviarEmailNotificacao(evento) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       user: 'naoresponda.recuperasenha@gmail.com',
       pass: 'pdld xbkx tomm pune'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Agenda da Igreja" <paulo.opensource@gmail.com>',
      to: 'paulosergio.suporte@yahoo.com.br',
      subject: `📅 Lembrete: Evento "${evento.titulo}" amanhã`,
      html: `
        <h3>Olá Pastor,</h3>
        <p>Você tem um evento agendado para amanhã:</p>
        <ul>
          <li><strong>Título:</strong> ${evento.titulo}</li>
          <li><strong>Descrição:</strong> ${evento.descricao}</li>
          <li><strong>Local:</strong> ${evento.local}</li>
          <li><strong>Data:</strong> ${evento.data_inicio}</li>
        </ul>
        <p>Deus te abençoe!</p>
      `
    });

    console.log('✅ E-mail enviado para evento:', evento.titulo);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
  }
} 

app.get("/aniversariantes/hoje", verificarAutenticacao, (req, res) => {
  if (!req.session.adminId) return res.redirect("/");

  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1;

  pgPool.query(
    `SELECT * FROM membros 
     WHERE EXTRACT(DAY FROM data_nascimento) = $1 
     AND EXTRACT(MONTH FROM data_nascimento) = $2 
     AND admin_id = $3`,
    [dia, mes, req.session.adminId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Erro ao buscar aniversariantes do dia.");
      }
      res.render("aniversariantes_hoje", { aniversariantesHoje: result.rows });
    }
  );
});





app.get('/aniversariantes', verificarAutenticacao, (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();

  // Buscar aniversariantes do mês
  pgPool.query(
    `SELECT * FROM membros 
     WHERE EXTRACT(MONTH FROM data_nascimento) = $1 
     AND admin_id = $2`,
    [mesAtual, adminId],
    (err, mesResult) => {
      if (err) {
        console.error(err);
        return res.send('Erro ao buscar aniversariantes do mês');
      }

      // Buscar aniversariantes do dia
      pgPool.query(
        `SELECT * FROM membros 
         WHERE EXTRACT(MONTH FROM data_nascimento) = $1 
         AND EXTRACT(DAY FROM data_nascimento) = $2 
         AND admin_id = $3`,
        [mesAtual, diaAtual, adminId],
        (err2, hojeResult) => {
          if (err2) {
            console.error(err2);
            return res.send('Erro ao buscar aniversariantes do dia');
          }

          res.render('aniversariantes', {
            aniversariantesHoje: hojeResult.rows,
            aniversariantesMes: mesResult.rows
          });
        }
      );
    }
  );
});



app.get('/enviar-parabens/:id', verificarAutenticacao, (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;

  const membroId = req.params.id;

  pgPool.query('SELECT * FROM membros WHERE id = $1', [membroId], (err, result) => {
    if (err || result.rowCount === 0) {
      console.error(err);
      return res.status(500).send('Erro ao buscar o membro.');
    }

    const membro = result.rows[0];

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'membersinchurch@gmail.com',
        pass: 'vktk uafi deih ztaj'
      }
    });

    const mailOptions = {
      from: 'Members In Church <membersinchurch@gmail.com>',
      to: membro.email,
      subject: `🎉 Feliz Aniversário, ${membro.nome}!`,
      html: `<!-- email HTML aqui, com ${membro.nome} etc -->`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar e-mail:', error);
        return res.status(500).send('Erro ao enviar o e-mail.');
      }

      console.log('E-mail enviado:', info.response);
      res.render('enviar-parabens', { membro, mensagem: 'Email Enviado com Sucesso!' });
    });
  });
});




app.post('/cadastro_membros', verificarAutenticacao, upload.single("foto"), async (req, res) => {
         const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  if (!req.session.adminId) return res.redirect("/");

  const { nome, email, data_nascimento, telefone, funcao, endereco, sexo, ministerio_id } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null; // Caminho relativo sem "public"

  try {
    // Verificar se o ministério existe (se for necessário)
    if (ministerio_id) {
      const ministerioCheck = await pgPool.query(
        'SELECT id FROM ministerios WHERE id = $1 AND admin_id = $2',
        [ministerio_id, adminId]
      );
      if (ministerioCheck.rows.length === 0) {
        throw new Error('Ministério não encontrado');
      }
    }

    await pgPool.query(
      `INSERT INTO membros 
       (nome, email, data_nascimento, telefone, funcao, endereco, foto, admin_id, sexo, ministerio_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [nome, email, data_nascimento, telefone, funcao, endereco, foto, adminId, sexo, ministerio_id || null]
    );

    req.session.mensagem = "Membro cadastrado com sucesso!";
    res.redirect("/lista_membros");
  } catch (err) {
    console.error("Erro ao cadastrar membro:", err);

    // Recuperar ministérios para mostrar novamente no formulário
    const ministerios = await pgPool.query(
      'SELECT id, nome FROM ministerios WHERE admin_id = $1',
      [adminId]
    );

    res.render("cadastro_membros", {
      ministerios: ministerios.rows,
      mensagem: "Erro ao cadastrar: " + err.message,
      valores: req.body // Manter dados digitados
    });
  }
});

// Ver membros (para usuários)
app.get('/usuario/membros', verificarUsuarioAutenticado, (req, res) => {
  const adminId = req.session.userId;

  pgPool.query('SELECT * FROM membros WHERE admin_id = ?', [adminId], (err, membros) => {
    if (err) {
      console.error('Erro ao buscar membros:', err);
      return res.status(500).send('Erro ao buscar membros.');
    }

    res.render('dashboard', { membros, mensagem: null }); // Corrigido!
  });
});



// Página de edição de membro
// Rota GET para exibir o formulário de edição
app.get("/editar/:id", verificarAutenticacao, async (req, res) => {
       const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

    console.log('Sessão atual:', req.session);

  const membroId = req.params.id;

  try {
    // Buscar membro pertencente ao admin logado
    const { rows } = await pgPool.query(
      "SELECT * FROM membros WHERE id = $1 AND admin_id = $2",
      [membroId, adminId]
    );

    if (rows.length === 0) {
      return res.status(404).send("Membro não encontrado");
    }

    const membro = rows[0];

    // Buscar ministérios do admin
    const ministeriosQuery = await pgPool.query(
      "SELECT * FROM ministerios WHERE admin_id = $1",
      [adminId]
    );
    const ministerios = ministeriosQuery.rows;

    res.render("editar", { membro, ministerios });

  } catch (error) {
    console.error("Erro ao carregar dados para edição:", error);
    res.status(500).send("Erro ao carregar membro para edição.");
  }
});



// Rota POST para atualizar o membro
// Rota POST /editar/:id
app.post('/editar/:id', verificarAutenticacao, upload.single('foto'), async (req, res) => {
         const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  const id = req.params.id;

  const {
    nome,
    email,
    telefone,
    data_nascimento,
    sexo,
    ministerio_id,
    capturedImage
  } = req.body;

  let fotoPath = null;

  // Se for imagem capturada via câmera
  if (capturedImage && capturedImage.startsWith('data:image')) {
    const base64Data = capturedImage.replace(/^data:image\/\w+;base64,/, '');
    const fileName = `foto_${Date.now()}.png`;
    const filePath = path.join(__dirname, 'public/uploads', fileName);
    fs.writeFileSync(filePath, base64Data, 'base64');
    fotoPath = `/uploads/${fileName}`;
  } else if (req.file) {
    // Se for imagem enviada via upload
    fotoPath = `/uploads/${req.file.filename}`;
  }

  try {
    // Buscar dados antigos do membro garantindo que ele pertence ao admin/usuário logado
    const { rows } = await pgPool.query(
      'SELECT * FROM membros WHERE id = $1 AND admin_id = $2',
      [id, adminId]
    );

    const membro = rows[0];

    if (!membro) {
      return res.status(404).send('Membro não encontrado ou não pertence a este administrador.');
    }

    // Atualizar os campos preenchidos
    const updated = {
      nome: nome || membro.nome,
      email: email || membro.email,
      telefone: telefone || membro.telefone,
      data_nascimento: data_nascimento || membro.data_nascimento,
      sexo: sexo || membro.sexo,
      ministerio_id: ministerio_id || membro.ministerio_id,
      foto: fotoPath || membro.foto
    };

    await pgPool.query(`
      UPDATE membros SET
        nome = $1,
        email = $2,
        telefone = $3,
        data_nascimento = $4,
        sexo = $5,
        ministerio_id = $6,
        foto = $7
      WHERE id = $8 AND admin_id = $9
    `, [
      updated.nome,
      updated.email,
      updated.telefone,
      updated.data_nascimento,
      updated.sexo,
      updated.ministerio_id,
      updated.foto,
      id,
      adminId
    ]);

    res.redirect('/lista_membros');

  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    res.status(500).send('Erro no servidor');
  }
});




app.post("/excluir/:id", verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;

  try {
    // Exclui apenas membros que pertencem ao mesmo adminId da sessão
    await pgPool.query(
      "DELETE FROM membros WHERE id = $1 AND admin_id = $2",
      [req.params.id, adminId]
    );

    res.redirect("/lista_membros");
  } catch (err) {
    console.error("Erro ao excluir membro:", err);
    res.status(500).send("Erro ao excluir membro.");
  }
});
;


app.post("/enviar-parabens", verificarAutenticacao, (req, res) => {
  if (!req.session.adminId) return res.redirect("/");

  const { nome, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "paulo.opensource@gmail.com",
      pass: "xdba mzgg rqyl rdfs" // use a senha de app gerada
    }
  });

  const mailOptions = {
    from: '"Members In Church" <SEU_EMAIL@gmail.com>',
    to: email,
    subject: `🎉 Feliz Aniversário, ${nome}!`,
    html: `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2 style="color: #4CAF50;">🎉 Feliz Aniversário, ${nome}! 🎉</h2>
    <p style="font-size: 16px;">
      Que o Senhor continue te abençoando com saúde, alegria e muitos motivos para sorrir.
    </p>
    <p style="font-size: 16px;">
      Toda a família da igreja celebra esse dia especial com você. 🙌
    </p>
    <p style="margin-top: 30px;">Com carinho,<br><strong>Igreja Members In Church</strong></p>
  </div>
`

  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send("Erro ao enviar e-mail.");
    }
    res.render("enviar-parabens", { nome });


  });
});

cron.schedule("0 8 * * *", () => {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');

  pgPool.query(
    `SELECT nome, email FROM membros WHERE EXTRACT('%d', data_nascimento) = $1 AND EXTRACT('%m', data_nascimento) = $2`,
    [dia, mes],
    (err, aniversariantes) => {
      if (err) {
        console.log("Erro ao buscar aniversariantes:", err);
        return;
      }

      if (aniversariantes.length === 0) {
        console.log("Nenhum aniversariante hoje.");
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "naoresponda,recuperasenha@gmail.com",
          pass: "crfo dive cghr rdch"
        }
      });

      aniversariantes.forEach(({ nome, email }) => {
        const mailOptions = {
          from: '"Members In Church" <paulo.opensource@gmail.com>',
          to: email,
          subject: `🎉 Feliz Aniversário, ${nome}!`,
          html: `<p>Olá <strong>${nome}</strong>,</p>
                 <p>Desejamos a você um dia repleto de bênçãos e alegrias!</p>
                 <p>Feliz Aniversário! 🥳</p>
                 <p>— Members In Church</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log(`Erro ao enviar para ${email}:`, error);
          else console.log(`E-mail automático enviado para ${email}`);
        });
      });
    }
  );
});

const saltRounds = 10;

// Rota GET para exibir o formulário de cadastro
app.get("/cadastro-admin", (req, res) => {
  res.render("cadastrar_admin");
});

// Rota POST para processar o cadastro
app.post("/cadastro-admin", (req, res) => {
  const { nome, email, username, password, confirm_password } = req.body;

  // Verificando se as senhas são iguais
  if (password !== confirm_password) {
    return res.render("cadastrar_admin", { error: "As senhas não coincidem!" });
  }

  // Verificando se o username já existe no banco de dados
  pgPool.query("SELECT * FROM admins WHERE username = ?", [username], (err, adminExistente) => {
    if (err) {
      return res.send("Erro ao verificar o banco de dados");
    }
    if (adminExistente) {
      return res.render("cadastrar_admin", { error: "Nome de usuário já existente!" });
    }

    // Criptografando a senha antes de salvar no banco
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.send("Erro ao criptografar a senha");
      }

      // Inserir o novo administrador no banco de dados
      pgPool.query(
        "INSERT INTO admins (nome, email, username, password) VALUES ($1, $2, $3, $4)",
        [nome, email, username, hashedPassword],
        (err) => {
          if (err) {
            return res.send("Erro ao cadastrar administrador");
          }
          res.redirect("/"); // Redireciona para a página de login após o cadastro

          

        }
      );
    });
  });
});

app.get("/eventos/novo", verificarAutenticacao, (req, res) => {
const adminId = req.session.adminId || req.session.usuarioAdminId;
  res.render("novo_evento");
});

app.post("/eventos", verificarAutenticacao, async (req, res) => {
const adminId = req.session.adminId || req.session.usuarioAdminId;
  const { titulo, descricao, local, data_inicio, data_fim } = req.body;

  if (!adminId) {
    return res.status(401).send("Usuário não autenticado.");
  }

  try {
    await pgPool.query(
      `INSERT INTO eventos (admin_id, titulo, descricao, local, data_inicio, data_fim)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        titulo,
        descricao,
        local,
        data_inicio,
        data_fim || data_inicio
      ]
    );

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Erro ao salvar evento no banco de dados:", err);
    res.status(500).send("Erro ao salvar evento.");
  }
});


app.get('/eventos/editar/:id', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;
  const eventoId = req.params.id;

  try {
    const result = await pgPool.query(
      'SELECT * FROM eventos WHERE id = $1 AND admin_id = $2',
      [eventoId, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Evento não encontrado ou você não tem permissão.");
    }

    res.render('editar_evento', { evento: result.rows[0] });
  } catch (err) {
    console.error("Erro ao buscar evento:", err);
    res.status(500).send("Erro ao buscar evento.");
  }
});

// PUT /eventos/:id — editar evento via API REST
app.put('/eventos/:id', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;
  if (!adminId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const id = req.params.id;
  const { titulo, data_inicio, data_fim, descricao, local, categoria } = req.body;

  if (!titulo || !data_inicio) {
    return res.status(400).json({ error: 'Título e data de início são obrigatórios.' });
  }

  try {
    const query = `
      UPDATE eventos
      SET titulo = $1,
          data_inicio = $2,
          data_fim = $3,
          descricao = $4,
          local = $5,
          categoria = $6
      WHERE id = $7 AND admin_id = $8
      RETURNING *;
    `;

    console.log('Query:', query); // Adicione isto
        console.log('Valores:', [titulo, data_fim, descricao, local, id]); // Adicione isto

    const values = [titulo, data_inicio, data_fim || null, descricao || null, local || null, categoria || null, id, adminId];

    const resultado = await pgPool.query(query, values);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado ou não pertence ao administrador.' });
    }

    res.json({ message: 'Evento atualizado com sucesso!', evento: resultado.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento.' });
  }
});

app.post('/eventos/editar/:id', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;
    console.log('➡️ Rota POST /eventos/editar chamada');

  const eventoId = req.params.id;
  const { titulo, descricao, local, data_inicio, data_fim } = req.body;

  console.log('Dados recebidos para edição:', {
    eventoId,
    adminId,
    titulo,
    descricao,
    local,
    data_inicio,
    data_fim
  });

  try {
    await pgPool.query(
      `UPDATE eventos
       SET titulo = $1, descricao = $2, local = $3, data_inicio = $4, data_fim = $5
       WHERE id = $6 AND admin_id = $7`,
      [
        titulo,
        descricao,
        local,
        data_inicio,
        data_fim || data_inicio,
        eventoId,
        adminId
      ]
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    res.status(500).send("Erro ao atualizar evento.");
  }
});



app.post('/eventos/excluir/:id', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;
  const eventoId = req.params.id;

  try {
    await pgPool.query(
      'DELETE FROM eventos WHERE id = $1 AND admin_id = $2',
      [eventoId, adminId]
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error("Erro ao excluir evento:", err);
    res.status(500).send("Erro ao excluir evento.");
  }
});





  app.get('/agenda', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;


  if (!adminId) {
    return res.status(403).send("Administrador não autenticado.");
  }

  try {
    const { rows: eventos } = await pgPool.query(
      "SELECT * FROM eventos WHERE admin_id = $1", 
      [adminId]
    );
    res.render("agenda", { eventos });
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).send("Erro ao buscar eventos.");
  }
});


app.get('/api/eventos', async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;
  console.log('adminId na rota /api/eventos:', adminId);

  if (!adminId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const resultado = await pgPool.query(
      'SELECT * FROM eventos WHERE admin_id = $1',
      [adminId]
    );

    const eventos = resultado.rows.map(evento => ({
      id: evento.id,
      title: evento.titulo,
      start: evento.data_inicio ? evento.data_inicio.toISOString().split('T')[0] : null,
      end: evento.data_fim ? evento.data_fim.toISOString().split('T')[0] : null,
      extendedProps: {
        descricao: evento.descricao,
        local: evento.local,
        categoria: evento.categoria
      }
    }));

    console.log('Eventos formatados:', eventos);

    res.json(eventos);
  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});



app.get('/visitantes', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;

  try {
    const resultado = await pgPool.query(
      'SELECT * FROM visitantes WHERE admin_id = $1',
      [adminId]
    );
    const visitantes = resultado.rows;

    res.render('visitantes', { visitantes });
  } catch (err) {
    console.error('Erro ao buscar visitantes:', err);
    res.status(500).send('Erro ao carregar visitantes.');
  }
});


app.post('/visitantes/adicionar', verificarAutenticacao, async (req, res) => {
  const { nome, whatsapp, observacao, data_visita } = req.body;
  const adminId = req.session.adminId || req.session.usuarioAdminId;

  try {
    await pgPool.query(
      `INSERT INTO visitantes (nome, whatsapp, observacao, data_visita, admin_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [nome, whatsapp, observacao, data_visita, adminId]
    );
    res.redirect('/visitantes');
  } catch (err) {
    console.error('Erro ao adicionar visitante:', err);
    res.status(500).send('Erro ao cadastrar visitante.');
  }
});

app.post('/visitantes/excluir/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await pgPool.query('DELETE FROM visitantes WHERE id = $1', [id]);
    res.redirect('/visitantes');
  } catch (err) {
    console.error('Erro ao excluir visitante:', err);
    res.status(500).send('Erro ao excluir visitante.');
  }
});


// PATCH - Atualizar status de contato
app.patch('/visitantes/:id/contato', async (req, res) => {
    try {
        const { id } = req.params;
        const { observacao } = req.body;
        
        await pgPool.query(
            `UPDATE visitantes SET observacao = $1 
             WHERE id = $2 AND admin_id = $3`,
            [observacao, id, req.session.user.adminId]
        );
        
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar' });
    }
});

app.put('/visitantes/:id/contato', (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE visitantes SET observacao = 1 WHERE id = $1`;
  pgPool.query(sql, [id], function (err) {
    if (err) {
      console.error('Erro ao atualizar observacao:', err.message);
      return res.status(500).json({ error: 'Erro ao marcar contato.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Visitante não encontrado.' });
    }

    res.json({ message: 'Contato marcado com sucesso!' });
  });
});


// POST - Cadastrar novo visitante
app.post('/visitantes', verificarAutenticacao, async (req, res) => {
    try {
        const { nome, whatsapp, data_visita, observacoes } = req.body;
        
        // Validação dos campos
        if (!nome || !whatsapp) {
            return res.status(400).json({ 
                error: 'Nome e WhatsApp são obrigatórios' 
            });
        }

        const result = await pgPool.query(
            `INSERT INTO visitantes 
             (nome, whatsapp, data_visita, observacoes, admin_id) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, nome, whatsapp, data_visita`,
            [
                nome.trim(),
                whatsapp.replace(/\D/g, ''), // Remove não-numéricos
                data_visita || new Date().toISOString().split('T')[0],
                observacoes || null,
                req.session.user.adminId
            ]
        );
        
        res.status(201).json({
            success: 'Visitante cadastrado com sucesso',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro em POST /visitantes:', err);
        
        if (err.code === '23505') { // Violação de unique constraint
            return res.status(400).json({ 
                error: 'Já existe um visitante com este WhatsApp' 
            });
        }
        
        res.status(500).json({ 
            error: 'Erro ao cadastrar visitante' 
        });
    }
});

// PATCH - Atualizar status de contato
app.patch('/visitantes/:id/contato', async (req, res) => {
    try {
        const { id } = req.params;
        const { observacao } = req.body;
        
        await pgPool.query(
            `UPDATE visitantes SET observacao = $1 
             WHERE id = $2 AND admin_id = $3`,
            [observacao, id, req.session.user.adminId]
        );
        
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar' });
    }
});

app.put('/visitantes/:id/contato', (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE visitantes SET observacao = 1 WHERE id = $1`;
  pgPool.query(sql, [id], function (err) {
    if (err) {
      console.error('Erro ao atualizar observacao:', err.message);
      return res.status(500).json({ error: 'Erro ao marcar contato.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Visitante não encontrado.' });
    }

    res.json({ message: 'Contato marcado com sucesso!' });
  });
});



app.delete('/eventos/:id', verificarAutenticacao, (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId;
  const eventoId = req.params.id;

  if (!adminId) {
    return res.status(403).json({ error: "Usuário não autenticado." });
  }

  const sql = `DELETE FROM eventos WHERE id = $1 AND admin_id = $2`;

  pgPool.query(sql, [eventoId, adminId], function(err) {
    if (err) {
      console.error("Erro ao excluir evento:", err);
      return res.status(500).json({ error: "Erro ao excluir evento." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Evento não encontrado ou sem permissão." });
    }

    res.json({ message: "Evento excluído com sucesso." });
  });
});


// Rota para exibir os avisos
app.get('/avisos', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  try {

    // Buscando avisos do administrador
    const resultado = await pgPool.query(
      'SELECT * FROM avisos WHERE admin_id = $1 ORDER BY id DESC',
      [adminId]
    );

    res.render('avisos', {
      avisos: resultado.rows // deve ser um array
    });

  } catch (err) {
    console.error('Erro ao carregar avisos:', err);
    res.status(500).send('Erro ao carregar avisos');
  }
});

// Adicionar novo aviso
app.post('/avisos', verificarAutenticacao, async (req, res) => {
    const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  const { texto } = req.body;

  if (!texto || !adminId) {
    return res.status(400).send('Texto do aviso e adminId são obrigatórios.');
  }

  try {
    await pgPool.query(
      'INSERT INTO avisos (texto, concluido, admin_id) VALUES ($1, false, $2)',
      [texto, adminId]
    );

    res.redirect('/avisos');
  } catch (err) {
    console.error('Erro ao adicionar aviso:', err);
    res.status(500).send('Erro ao adicionar aviso.');
  }
});


// Marcar/desmarcar aviso como concluído
app.post('/avisos/:id/toggle', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui 
  const avisoId = parseInt(req.params.id);

  try {
    // Buscar o status atual do aviso
    const avisoAtual = await pgPool.query(
      'SELECT concluido FROM avisos WHERE id = $1 AND admin_id = $2',
      [avisoId, adminId]
    );

    if (avisoAtual.rows.length === 0) {
      return res.status(404).send('Aviso não encontrado.');
    }

    const statusAtual = avisoAtual.rows[0].concluido;
    const novoStatus = !statusAtual;

    // Atualizar o status no banco
    await pgPool.query(
      'UPDATE avisos SET concluido = $1 WHERE id = $2 AND admin_id = $3',
      [novoStatus, avisoId, adminId]
    );

    res.redirect('/avisos');

  } catch (err) {
    console.error('Erro ao atualizar aviso:', err);
    res.status(500).send('Erro ao atualizar aviso');
  }
});


// Excluir aviso
app.post('/avisos/:id/delete', verificarAutenticacao, async (req, res) => {
  const adminId = req.session.adminId || req.session.usuarioAdminId; // ✅ aqui o ajuste

  const avisoId = parseInt(req.params.id);

  try {
    await pgPool.query(
      'DELETE FROM avisos WHERE id = $1 AND admin_id = $2',
      [avisoId, adminId]
    );

    res.redirect('/avisos');

  } catch (err) {
    console.error('Erro ao excluir aviso:', err);
    res.status(500).send('Erro ao excluir aviso');
  }
});


const crypto = require('crypto');

app.post('/esqueci-senha', (req, res) => {
  const email = req.body.email;

  pgPool.query('SELECT * FROM usuarios WHERE email = $1', [email], (err, result) => {
    if (err) return res.render('esqueci-senha', { error: 'Erro ao verificar o e-mail.', success: null });

    if (result.rows.length > 0) {
      // Usuário comum
      salvarToken(email, 'usuarios');
    } else {
      // Verificar se é administrador
        pgPool.query('SELECT * FROM admins WHERE email = $1', [email], (err2, result2) => {
        if (err2 || result2.rows.length === 0) {
          return res.render('esqueci-senha', { error: 'E-mail não encontrado.', success: null });
        }

        salvarToken(email, 'admins');
      });
    }
  });

  function salvarToken(email, tipo_usuario) {
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    pgPool.query(
      'INSERT INTO password_tokens (email, token, expires_at, tipo_usuario) VALUES ($1, $2, $3, $4)',
      [email, token, expiresAt.toISOString(), tipo_usuario],
      (err) => {
        if (err) {
          return res.render('esqueci-senha', { error: 'Erro ao salvar o token.', success: null });
        }

        const resetLink = `http://localhost:3000/nova-senha/${token}`;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'naoresponda.recuperasenha@gmail.com',
            pass: 'crfo dive cghr rdch',
          },
        });

        const mailOptions = {
          from: 'naoresponda.recuperasenha@gmail.com',
          to: email,
          subject: 'Recuperação de senha - Members In Church',
          html: `<p>Clique no link abaixo para redefinir sua senha:</p>
                 <p><a href="${resetLink}">${resetLink}</a></p>`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            return res.render('esqueci-senha', { error: 'Erro ao enviar o e-mail.', success: null });
          }

          res.render('esqueci-senha', {
            success: 'E-mail enviado com sucesso!',
            error: null,
          });
        });
      }
    );
  }
});


app.get('/esqueci-senha', (req, res) => {
  res.render('esqueci-senha', { error: null, success: null });
});

app.get('/nova-senha/:token', (req, res) => {
  const token = req.params.token;

  pgPool.query(
    'SELECT * FROM password_tokens WHERE token = $1 AND expires_at > $2',
    [token, new Date().toISOString()],
    (err, row) => {
      if (err || !row) {
        return res.render('nova-senha', { token: null, error: 'Token inválido ou expirado.', success: null });
      }

      res.render('nova-senha', { token, error: null, success: null });
    }
  );
});


app.post('/nova-senha/:token', async (req, res) => {
  const token = req.params.token;
  const novaSenha = req.body.senha;

  try {
    const tokenResult = await pgPool.query(
      'SELECT * FROM password_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.render('nova-senha', {
        token: null,
        error: 'Token inválido ou expirado.',
        success: null
      });
    }

    const { email, tipo_usuario } = tokenResult.rows[0];
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza na tabela correta
    const tabelaAlvo = tipo_usuario === 'admins' ? 'admins' : 'usuarios';

    await pgPool.query(
      `UPDATE ${tabelaAlvo} SET senha = $1 WHERE email = $2`,
      [senhaHash, email]
    );

    // Remove o token após uso
    await pgPool.query('DELETE FROM password_tokens WHERE token = $1', [token]);

    res.render('nova-senha', {
      token: null,
      success: 'Senha redefinida com sucesso. Você já pode fazer login.',
      error: null
    });

  } catch (err) {
    console.error('Erro em /nova-senha:', err);
    res.render('nova-senha', {
      token: null,
      error: 'Erro ao processar sua solicitação.',
      success: null
    });
  }
});

