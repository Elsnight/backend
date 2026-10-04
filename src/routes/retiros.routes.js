const router = require("express").Router();
const controller = require("../controllers/retiros.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { validarRetiroSchema } = require("../schemas/retiros.schema");

/**
 * @openapi
 * /api/retiros/validar:
 *   post:
 *     tags: [Retiros]
 *     summary: Validar y registrar el retiro pagado de una sucursal propia
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [codigo_retiro, metodo_validacion]
 *             properties:
 *               codigo_retiro: { type: string, maxLength: 12 }
 *               metodo_validacion: { type: string, enum: [QR, CODIGO_MANUAL] }
 *               observacion: { type: string, maxLength: 300 }
 *     responses:
 *       201: { description: Retiro creado y reserva marcada RETIRADA }
 *       400: { description: Body inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Sucursal ajena o rol incorrecto }
 *       404: { description: Código no encontrado }
 *       409: { description: Estado no válido o ausencia de pago aprobado }
 *       422: { description: RETIRO_VENCIDO }
 */
router.post(
  "/validar",
  authenticate,
  authorize("COMERCIANTE"),
  validate(validarRetiroSchema),
  controller.validarRetiro
);

module.exports = router;
