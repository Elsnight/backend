const router = require("express").Router();
const reservasController = require("../controllers/reservas.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearReservaSchema } = require("../schemas/reservas.schema");
const idempotency = require("../middlewares/idempotency");

/**
 * @openapi
 * /api/reservas:
 *   post:
 *     tags: [Reservas]
 *     summary: Crear una nueva reserva (CONSUMIDOR) — soporta idempotencia offline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema: { type: string, format: uuid }
 *         description: UUID v4 para evitar duplicados por reintento offline
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oferta_id: { type: string, format: uuid }
 *               cantidad: { type: integer }
 *               base_updated_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha ISO 8601 de la última sincronización del cliente para detección de conflictos
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Error de validación o stock insuficiente
 *       409:
 *         description: Conflicto de sincronización (CONFLICTO_SINCRONIZACION) o stock agotado (STOCK_INSUFICIENTE)
 */
router.post("/", authenticate, authorize("CONSUMIDOR"), validate(crearReservaSchema), idempotency(), reservasController.crearReserva);

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
 *     summary: Cancelar una reserva (CONSUMIDOR, solo si está pendiente) — soporta idempotencia offline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema: { type: string, format: uuid }
 *         description: UUID v4 para evitar duplicados por reintento offline
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Reserva cancelada
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 */
router.patch("/:id/cancelar", authenticate, authorize("CONSUMIDOR"), idempotency(), reservasController.cancelarReserva);

module.exports = router;

/**
 * ENDPOINTS PENDIENTES DE ADOPTAR IDEMPOTENCIA (modo offline futuro):
 * - POST /api/ofertas  (crear oferta desde offline)
 * - PUT /api/ofertas/:id  (actualizar oferta desde offline)
 * - PATCH /api/ofertas/:id/estado  (cambiar estado desde offline)
 * - POST /api/comercios  (registrar comercio desde offline)
 * - POST /api/comercios/:id/sucursales  (crear sucursal desde offline)
 */