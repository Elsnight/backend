// TODO: Implementar lógica de registro con bcrypt, validación con zod, creación de usuario
function registro(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Registro no implementado" } });
}

// TODO: Implementar lógica de login con verificación de contraseña, generación de JWT access/refresh
function login(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Login no implementado" } });
}

// TODO: Implementar rotación de refresh token
function refresh(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Refresh no implementado" } });
}

// TODO: Implementar revocación de refresh token
function logout(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Logout no implementado" } });
}

module.exports = { registro, login, refresh, logout };