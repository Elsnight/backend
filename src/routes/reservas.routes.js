const router = require("express").Router();
const controller = require("../controllers/reservas.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearReservaSchema } = require("../schemas/reservas.schema");
const idempotency = require("../middlewares/idempotency");

/**
 * @openapi
 * /api/reservas:
 *   post:
 *     tags: [Reservas]
 *     summary: Reservar uno o más ítems de una sucursal; queda PENDIENTE_PAGO
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: header, name: Idempotency-Key, schema: { type: string }, description: Clave recomendada para reintentos }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [sucursal_id, items]
 *             properties:
 *               sucursal_id: { type: string, format: uuid }
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required: [oferta_id, cantidad]
 *                   properties:
 *                     oferta_id: { type: string, format: uuid }
 *                     cantidad: { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: Reserva creada en PENDIENTE_PAGO y stock descontado }
 *       400: { description: Body inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Requiere rol CONSUMIDOR }
 *       404: { description: Sucursal u oferta inexistente }
 *       409: { description: Stock insuficiente o ofertas de otra sucursal }
 */
router.post("/", authenticate, authorize("CONSUMIDOR"), validate(crearReservaSchema), idempotency(), controller.crearReserva);

/**
 * @openapi
 * /api/reservas/mias:
 *   get:
 *     tags: [Reservas]
 *     summary: Listar reservas del consumidor
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Reservas con ítems y estado real }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Requiere rol CONSUMIDOR }
 */
router.get("/mias", authenticate, authorize("CONSUMIDOR"), controller.listarMisReservas);

/**
 * @openapi
 * /api/reservas/{id}/cancelar:
 *   patch:
 *     tags: [Reservas]
 *     summary: Cancelar una reserva, reponer stock y reversar su pago aprobado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: header, name: Idempotency-Key, schema: { type: string }, description: Clave recomendada para reintentos }
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Reserva cancelada }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Reserva ajena o rol incorrecto }
 *       404: { description: Reserva inexistente }
 *       409: { description: Estado no cancelable }
 */
router.patch("/:id/cancelar", authenticate, authorize("CONSUMIDOR"), idempotency(), controller.cancelarReserva);

module.exports = router;
