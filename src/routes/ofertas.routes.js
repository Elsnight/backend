const router = require("express").Router();
const ofertasController = require("../controllers/ofertas.controller");
const { authenticate, authorize, isOwner } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearOfertaSchema, actualizarOfertaSchema, cambiarEstadoSchema } = require("../schemas/ofertas.schema");

/**
 * @openapi
 * /api/ofertas:
 *   get:
 *     tags: [Ofertas]
 *     summary: Listar ofertas disponibles (público)
 *     parameters:
 *       - in: query
 *         name: categoria_id
 *         schema: { type: integer }
 *       - in: query
 *         name: ciudad
 *         schema: { type: string }
 *       - in: query
 *         name: precio_max
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Lista de ofertas
 */
router.get("/", ofertasController.listarOfertas);

/**
 * @openapi
 * /api/ofertas/{id}:
 *   get:
 *     tags: [Ofertas]
 *     summary: Obtener detalle de una oferta (público)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Detalle de la oferta
 *       404:
 *         description: Oferta no encontrada
 */
router.get("/:id", ofertasController.obtenerOferta);

/**
 * @openapi
 * /api/ofertas:
 *   post:
 *     tags: [Ofertas]
 *     summary: Crear una nueva oferta (COMERCIANTE)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Oferta creada
 *       403:
 *         description: No autorizado
 */
router.post("/", authenticate, authorize("COMERCIANTE"), validate(crearOfertaSchema), ofertasController.crearOferta);

/**
 * @openapi
 * /api/ofertas/{id}:
 *   put:
 *     tags: [Ofertas]
 *     summary: Actualizar una oferta (dueño)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Oferta actualizada
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Oferta no encontrada
 */
router.put("/:id", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), validate(actualizarOfertaSchema), ofertasController.actualizarOferta);

/**
 * @openapi
 * /api/ofertas/{id}/estado:
 *   patch:
 *     tags: [Ofertas]
 *     summary: Cambiar estado de una oferta (dueño)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_oferta:
 *                 type: string
 *                 enum: [DISPONIBLE, AGOTADA, PAUSADA, EXPIRADA]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       403:
 *         description: No autorizado
 */
router.patch("/:id/estado", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), validate(cambiarEstadoSchema), ofertasController.cambiarEstadoOferta);

/**
 * @openapi
 * /api/ofertas/{id}:
 *   delete:
 *     tags: [Ofertas]
 *     summary: Eliminar (desactivar) una oferta (dueño)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Oferta eliminada/desactivada
 *       403:
 *         description: No autorizado
 */
router.delete("/:id", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), ofertasController.eliminarOferta);

module.exports = router;