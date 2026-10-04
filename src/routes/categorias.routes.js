const router = require("express").Router();
const controller = require("../controllers/categorias.controller");

/**
 * @openapi
 * /api/categorias:
 *   get:
 *     tags: [Categorías]
 *     summary: Listar categorías activas
 *     responses:
 *       200:
 *         description: Categorías disponibles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { type: object } }
 */
router.get("/", controller.listar);

module.exports = router;
