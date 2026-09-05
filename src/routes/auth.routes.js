const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { registroSchema, loginSchema, refreshTokenSchema } = require("../schemas/auth.schema");

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
 *             required: [nombres, apellidos, correo, contrasena, rol_id]
 *             properties:
 *               nombres: { type: string }
 *               apellidos: { type: string }
 *               correo: { type: string, format: email }
 *               contrasena: { type: string, minLength: 6 }
 *               rol_id: { type: integer }
 *               telefono: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: El correo ya está registrado
 */
router.post("/registro", validate(registroSchema), authController.registro);

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
 */
router.post("/login", validate(loginSchema), authController.login);

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