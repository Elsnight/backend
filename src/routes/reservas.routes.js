const router = require("express").Router();
const reservasController = require("../controllers/reservas.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearReservaSchema } = require("../schemas/reservas.schema");

/**
 * @openapi
 * /api/reservas:
 *   post:
 *     tags: [Reservas]
 *     summary: Crear una nueva reserva (CONSUMIDOR)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oferta_id: { type: string }
 *               cantidad: { type: integer }
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado
 */
router.post("/", authenticate, authorize("CONSUMIDOR"), validate(crearReservaSchema), reservasController.crearReserva);

/**
 * @openapi
 * /api/reservas/mias:
 *   get:
 *     tags: [Reservas]
 *     summary: Listar reservas del usuario autenticado (CONSUMIDOR)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario
 *       403:
 *         description: No autorizado
 */
router.get("/mias", authenticate, authorize("CONSUMIDOR"), reservasController.listarMisReservas);

/**
 * @openapi
 * /api/reservas/{id}/cancelar:
 *   patch:
 *     tags: [Reservas]
 *     summary: Cancelar una reserva (CONSUMIDOR, solo si está pendiente)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Reserva cancelada
 *       403:
 *         description: No autorizado
 */
router.patch("/:id/cancelar", authenticate, authorize("CONSUMIDOR"), reservasController.cancelarReserva);

module.exports = router;