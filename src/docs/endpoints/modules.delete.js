/**
 * @swagger
 * /api/modules/{moduleId}:
 *   delete:
 *     summary: Удалить модуль (admin)
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
 *     responses:
 *       204:
 *         description: Модуль удален
 *       404:
 *         description: Модуль не найден
 */
export {};
