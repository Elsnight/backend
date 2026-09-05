const router = require("express").Router();
const ofertasController = require("../controllers/ofertas.controller");
const { authenticate, authorize, isOwner } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearOfertaSchema, actualizarOfertaSchema, cambiarEstadoSchema } = require("../schemas/ofertas.schema");

router.get("/", ofertasController.listarOfertas);
router.get("/mias", authenticate, authorize("COMERCIANTE"), ofertasController.misOfertas);
router.get("/:id", ofertasController.obtenerOferta);
router.post("/", authenticate, authorize("COMERCIANTE"), validate(crearOfertaSchema), ofertasController.crearOferta);
router.put("/:id", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), validate(actualizarOfertaSchema), ofertasController.actualizarOferta);
router.patch("/:id/estado", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), validate(cambiarEstadoSchema), ofertasController.cambiarEstadoOferta);
router.delete("/:id", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), ofertasController.eliminarOferta);

module.exports = router;