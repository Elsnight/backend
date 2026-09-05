const router = require("express").Router();
const retirosController = require("../controllers/retiros.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.post("/validar", authenticate, authorize("COMERCIANTE"), retirosController.validarRetiro);
router.post("/:codigoRetiro/confirmar", authenticate, retirosController.confirmarRetiro);

module.exports = router;