const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

async function registro(req, res, next) {
  try {
    const { nombres, apellidos, correo, contrasena, rol_id, telefono } = req.body;
    const existente = await prisma.uSUARIO.findUnique({ where: { correo } });
    if (existente) return res.status(409).json(errorEnvelope("CONFLICT", "El correo ya está registrado"));
    const rol = await prisma.rOL.findUnique({ where: { rol_id } });
    if (!rol) return res.status(400).json(errorEnvelope("VALIDATION_ERROR", "El rol_id no es válido"));
    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await prisma.uSUARIO.create({
      data: { nombres, apellidos, correo, hash_contrasena: hash, rol_id, telefono: telefono || null, estado_usuario: "ACTIVO" },
      select: { usuario_id: true, nombres: true, apellidos: true, correo: true, telefono: true, rol_id: true, estado_usuario: true, fecha_registro: true },
    });
    return res.status(201).json(successEnvelope(usuario));
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await prisma.uSUARIO.findUnique({
      where: { correo },
      include: { rol: { select: { nombre: true } } },
    });
    if (!usuario) return res.status(401).json(errorEnvelope("UNAUTHORIZED", "Credenciales inválidas"));
    if (usuario.estado_usuario !== "ACTIVO") return res.status(403).json(errorEnvelope("FORBIDDEN", "Cuenta no activa"));
    const valida = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!valida) return res.status(401).json(errorEnvelope("UNAUTHORIZED", "Credenciales inválidas"));
    const payload = { usuario_id: usuario.usuario_id, correo: usuario.correo, rol: usuario.rol.nombre };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const token_hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await prisma.rEFRESH_TOKEN.create({ data: { usuario_id: usuario.usuario_id, token_hash, expira_en: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    return res.json(successEnvelope({ accessToken, refreshToken, usuario: { usuario_id: usuario.usuario_id, nombres: usuario.nombres, apellidos: usuario.apellidos, correo: usuario.correo, rol: usuario.rol.nombre } }));
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    let decoded;
    try { decoded = verifyRefreshToken(refreshToken); }
    catch { return res.status(401).json(errorEnvelope("UNAUTHORIZED", "Refresh token inválido o expirado")); }
    const token_hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const stored = await prisma.rEFRESH_TOKEN.findFirst({ where: { token_hash, revocado: false, expira_en: { gte: new Date() } } });
    if (!stored) return res.status(401).json(errorEnvelope("UNAUTHORIZED", "Refresh token revocado o no encontrado"));
    await prisma.rEFRESH_TOKEN.update({ where: { id: stored.id }, data: { revocado: true } });
    const usuario = await prisma.uSUARIO.findUnique({ where: { usuario_id: decoded.usuario_id }, include: { rol: { select: { nombre: true } } } });
    if (!usuario || usuario.estado_usuario !== "ACTIVO") return res.status(403).json(errorEnvelope("FORBIDDEN", "Usuario no activo"));
    const payload = { usuario_id: usuario.usuario_id, correo: usuario.correo, rol: usuario.rol.nombre };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    const new_hash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    await prisma.rEFRESH_TOKEN.create({ data: { usuario_id: usuario.usuario_id, token_hash: new_hash, expira_en: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    return res.json(successEnvelope({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json(errorEnvelope("VALIDATION_ERROR", "refreshToken es requerido"));
    const token_hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await prisma.rEFRESH_TOKEN.updateMany({ where: { token_hash, revocado: false }, data: { revocado: true } });
    return res.json(successEnvelope({ message: "Sesión cerrada exitosamente" }));
  } catch (err) { next(err); }
}

module.exports = { registro, login, refresh, logout };