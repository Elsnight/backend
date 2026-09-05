const router = require("express").Router();
const reservasController = require("../controllers/reservas.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearReservaSchema } = require("../schemas/reservas.schema");

router.post("/", authenticate, authorize("CONSUMIDOR"), validate(crearReservaSchema), reservasController.crearReserva);
router.get("/mias", authenticate, authorize("CONSUMIDOR"), reservasController.listarMisReservas);
router.patch("/:id/cancelar", authenticate, authorize("CONSUMIDOR"), reservasController.cancelarReserva);

module.exports = router;