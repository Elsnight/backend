const router = require("express").Router();
const favoritosController = require("../controllers/favoritos.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { marcarFavoritoSchema } = require("../schemas/favoritos.schema");
const idempotency = require("../middlewares/idempotency");

router.get("/", authenticate, authorize("CONSUMIDOR"), favoritosController.listarFavoritos);

router.post(
  "/",
  authenticate,
  authorize("CONSUMIDOR"),
  validate(marcarFavoritoSchema),
  idempotency(),
  favoritosController.marcarFavorito
);

router.delete(
  "/:comercioId",
  authenticate,
  authorize("CONSUMIDOR"),
  favoritosController.desmarcarFavorito
);

module.exports = router;