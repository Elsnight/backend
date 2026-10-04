const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { registroSchema, loginSchema, refreshTokenSchema } = require("../schemas/auth.schema");
const { rateLimit } = require("express-rate-limit");
const { errorEnvelope } = require("../utils/envelope");

function authRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler(req, res) {
      res.status(429).json(errorEnvelope("RATE_LIMIT_EXCEEDED", "Demasiados intentos; prueba de nuevo en 15 minutos"));
    },
  });
}

/**
 * @openapi
 * /api/auth/registro:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombres, apellidos, correo, contrasena]
 *             oneOf:
 *               - required: [rol]
 *               - required: [rol_nombre]
 *               - required: [rol_id]
 *             properties:
 *               nombres: { type: string, minLength: 1, maxLength: 100 }
 *               apellidos: { type: string, maxLength: 100, description: Puede ser vacío }
 *               correo: { type: string, format: email }
 *               contrasena: { type: string, minLength: 8, description: Al menos una letra y un número }
 *               rol: { type: string, enum: [CONSUMIDOR, COMERCIANTE], description: Usar rol o rol_nombre, no ambos }
 *               rol_nombre: { type: string, enum: [CONSUMIDOR, COMERCIANTE], description: Alias de rol usado por la app móvil }
 *               rol_id: { type: integer, enum: [1, 2], deprecated: true, description: Entrada heredada; usar solo una forma de rol }
 *               telefono: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Usuario creado; devuelve accessToken, refreshToken y usuario, igual que login
 *       400:
 *         description: Error de validación
 *       409:
 *         description: El correo ya está registrado
 *       429:
 *         description: Más de 10 intentos en 15 minutos desde la misma IP
 */
router.post("/registro", authRateLimiter(), validate(registroSchema), authController.registro);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, contrasena]
 *             properties:
 *               correo: { type: string, format: email }
 *               contrasena: { type: string }
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve accessToken y refreshToken
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Cuenta no activa
 *       429:
 *         description: Más de 10 intentos en 15 minutos desde la misma IP
 */
router.post("/login", authRateLimiter(), validate(loginSchema), authController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token usando refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nuevos tokens generados (rotación)
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión (revocar refresh token)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: No autenticado
 */
router.post("/logout", authenticate, authController.logout);

module.exports = router;
