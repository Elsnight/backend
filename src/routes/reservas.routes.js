const router = require("express").Router();
const reservasController = require("../controllers/reservas.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearReservaSchema } = require("../schemas/reservas.schema");
const idempotency = require("../middlewares/idempotency");

// Aplica idempotencia offline — Idempotency-Key en header
router.post("/", authenticate, authorize("CONSUMIDOR"), validate(crearReservaSchema), idempotency(), reservasController.crearReserva);

router.get("/mias", authenticate, authorize("CONSUMIDOR"), reservasController.listarMisReservas);

// Aplica idempotencia offline — Idempotency-Key en header
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