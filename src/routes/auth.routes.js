const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { registroSchema, loginSchema } = require("../schemas/auth.schema");

router.post("/registro", validate(registroSchema), authController.registro);
router.post("/login", validate(loginSchema), authController.login);
router.get("/perfil", authenticate, authController.perfil);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);

module.exports = router;