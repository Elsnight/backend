const router = require("express").Router();
const controller = require("../controllers/pagos.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearPagoSchema } = require("../schemas/pagos.schema");
const idempotency = require("../middlewares/idempotency");

/**
 * @openapi
 * /api/pagos:
 *   post:
 *     tags: [Pagos]
 *     summary: Ejecutar un pago simulado; no se conecta con una pasarela real
 *     description: El simulador crea un intento APROBADO o RECHAZADO. En aprobación mueve la reserva a LISTA_RETIRO.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: header, name: Idempotency-Key, schema: { type: string }, description: Clave para repetir la misma respuesta sin duplicar el intento }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [reserva_id, metodo_pago]
 *             properties:
 *               reserva_id: { type: string, format: uuid }
 *               metodo_pago: { type: string, enum: [TARJETA, TRANSFERENCIA, BILLETERA] }
 *               simular_rechazo: { type: boolean, default: false }
 *     responses:
 *       201: { description: Pago simulado aprobado y reserva lista para retiro }
 *       400: { description: Body inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Reserva ajena o rol incorrecto }
 *       404: { description: Reserva inexistente }
 *       409: { description: Estado no pagable o reserva expirada }
 *       422: { description: PAYMENT_REJECTED solicitado al simulador }
 */
router.post("/", authenticate, authorize("CONSUMIDOR"), validate(crearPagoSchema), idempotency(), controller.crear);

/**
 * @openapi
 * /api/pagos/reserva/{reservaId}:
 *   get:
 *     tags: [Pagos]
 *     summary: Consultar historial de intentos de pago de una reserva propia
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reservaId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Intentos ordenados del más reciente al más antiguo }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Reserva ajena o rol incorrecto }
 *       404: { description: Reserva inexistente }
 */
router.get("/reserva/:reservaId", authenticate, authorize("CONSUMIDOR"), controller.historial);

module.exports = router;
