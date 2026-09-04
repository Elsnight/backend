const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

/**
 * @openapi
 * /api/admin/comercios/pendientes:
 *   get:
 *     tags: [Admin]
 *     summary: Listar comercios pendientes de validación (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comercios pendientes
 *       403:
 *         description: No autorizado
 */
router.get("/comercios/pendientes", authenticate, authorize("ADMINISTRADOR"), adminController.listarPendientes);

/**
 * @openapi
 * /api/admin/comercios/{id}/estado:
 *   patch:
 *     tags: [Admin]
 *     summary: Aprobar o suspender un comercio (ADMIN)
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
 *               estado_comercio:
 *                 type: string
 *                 enum: [ACTIVO, SUSPENDIDO]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Comercio no encontrado
 */
router.patch("/comercios/:id/estado", authenticate, authorize("ADMINISTRADOR"), adminController.cambiarEstadoComercio);

module.exports = router;