// middlewares/autenticacao.js

function verificarAutenticado(req, res, next) {
  if (req.session && (req.session.adminId || req.session.usuarioId)) {
    return next();
  }
  return res.redirect('/login'); // ou a rota da sua tela de login
}

function verificarAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.redirect('/login');
}

function verificarUsuario(req, res, next) {
  if (req.session && req.session.usuarioId) {
    return next();
  }
  return res.redirect('/login');
}

module.exports = {
  verificarAutenticado,
  verificarAdmin,
  verificarUsuario
};
