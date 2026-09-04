const router = require("express").Router();
const retirosController = require("../controllers/retiros.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

/**
 * @openapi
 * /api/retiros/validar:
 *   post:
 *     tags: [Retiros]
 *     summary: Validar el retiro de una reserva (COMERCIANTE)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_retiro: { type: string }
 *               metodo_validacion:
 *                 type: string
 *                 enum: [QR, CODIGO_MANUAL]
 *               observacion: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Retiro validado exitosamente
 *       400:
 *         description: Código inválido o reserva no válida
 *       403:
 *         description: No autorizado
 */
router.post("/validar", authenticate, authorize("COMERCIANTE"), retirosController.validarRetiro);

module.exports = router;