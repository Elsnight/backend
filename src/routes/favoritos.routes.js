const router = require("express").Router();
const favoritosController = require("../controllers/favoritos.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { marcarFavoritoSchema } = require("../schemas/favoritos.schema");
const idempotency = require("../middlewares/idempotency");

/**
 * @openapi
 * /api/favoritos:
 *   get:
 *     tags: [Favoritos]
 *     summary: Listar favoritos del usuario autenticado (CONSUMIDOR)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comercios favoritos
 *       403:
 *         description: No autorizado
 */
router.get("/", authenticate, authorize("CONSUMIDOR"), favoritosController.listarFavoritos);

/**
 * @openapi
 * /api/favoritos:
 *   post:
 *     tags: [Favoritos]
 *     summary: Marcar un comercio como favorito (CONSUMIDOR) — soporta idempotencia offline
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
 *               comercio_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Favorito marcado exitosamente
 *       409:
 *         description: El favorito ya existe
 *       404:
 *         description: Comercio no encontrado
 */
router.post(
  "/",
  authenticate,
  authorize("CONSUMIDOR"),
  validate(marcarFavoritoSchema),
  idempotency(),
  favoritosController.marcarFavorito
);

/**
 * @openapi
 * /api/favoritos/{comercioId}:
 *   delete:
 *     tags: [Favoritos]
 *     summary: Desmarcar un comercio como favorito (CONSUMIDOR)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comercioId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Favorito desmarcado
 *       404:
 *         description: Favorito no encontrado
 *       403:
 *         description: No autorizado
 */
router.delete(
  "/:comercioId",
  authenticate,
  authorize("CONSUMIDOR"),
  favoritosController.desmarcarFavorito
);

module.exports = router;