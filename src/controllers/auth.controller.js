const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "dev-secreto-access-123";
const JWT_EXPIRES = "7d";

async function registro(req, res, next) {
  try {
    const { email, password, nombre, rol } = req.body;
    const existente = await prisma.uSUARIO.findUnique({ where: { correo: email } });
    if (existente) return res.status(409).json(errorEnvelope("CONFLICT", "El correo ya esta registrado"));
    const rolRecord = await prisma.rOL.findUnique({ where: { nombre: rol } });
    if (!rolRecord) return res.status(400).json(errorEnvelope("BAD_REQUEST", "Rol invalido"));
    const hash = await bcrypt.hash(password, 10);
    const usuario = await prisma.uSUARIO.create({ data: { rol_id: rolRecord.rol_id, nombres: nombre, apellidos: "", correo: email, hash_contrasena: hash, estado_usuario: "ACTIVO" }, select: { usuario_id: true, nombres: true, correo: true, rol: { select: { nombre: true } } } });
    const token = jwt.sign({ usuario_id: usuario.usuario_id, rol: usuario.rol.nombre }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json(successEnvelope({ token, usuario: { id: usuario.usuario_id, email: usuario.correo, nombre: usuario.nombres, rol: usuario.rol.nombre } }));
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const usuario = await prisma.uSUARIO.findUnique({ where: { correo: email }, select: { usuario_id: true, nombres: true, correo: true, hash_contrasena: true, estado_usuario: true, rol: { select: { nombre: true } } } });
    if (!usuario || usuario.estado_usuario !== "ACTIVO") return res.status(401).json(errorEnvelope("UNAUTHORIZED", "Credenciales invalidas"));
    if (!await bcrypt.compare(password, usuario.hash_contrasena)) return res.status(401).json(errorEnvelope("UNAUTHORIZED", "Credenciales invalidas"));
    const token = jwt.sign({ usuario_id: usuario.usuario_id, rol: usuario.rol.nombre }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json(successEnvelope({ token, usuario: { id: usuario.usuario_id, email: usuario.correo, nombre: usuario.nombres, rol: usuario.rol.nombre } }));
  } catch (err) { next(err); }
}

async function perfil(req, res, next) {
  try {
    const usuario = await prisma.uSUARIO.findUnique({ where: { usuario_id: req.usuario.usuario_id }, select: { usuario_id: true, nombres: true, correo: true, rol: { select: { nombre: true } } } });
    if (!usuario) return res.status(404).json(errorEnvelope("NOT_FOUND", "Usuario no encontrado"));
    res.json(successEnvelope({ id: usuario.usuario_id, email: usuario.correo, nombre: usuario.nombres, rol: usuario.rol.nombre }));
  } catch (err) { next(err); }
}

function refresh(req, res, next) { res.status(501).json(errorEnvelope("NOT_IMPLEMENTED", "Refresh no implementado")); }
function logout(req, res, next) { res.json(successEnvelope({ mensaje: "Sesion cerrada" })); }

module.exports = { registro, login, perfil, refresh, logout };
