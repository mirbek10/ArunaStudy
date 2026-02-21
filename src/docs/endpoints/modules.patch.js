/**
 * @swagger
 * /api/modules/{moduleId}:
 *   patch:
 *     summary: Обновить модуль (admin)
 *     tags: [Admin-Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID модуля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Модуль обновлен
 *       404:
 *         description: Модуль не найден
 */
export {};
