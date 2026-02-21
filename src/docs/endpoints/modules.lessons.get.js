/**
 * @swagger
 * /api/modules/{moduleId}/lessons:
 *   get:
 *     summary: Получить уроки модуля
 *     tags: [Student-Modules]
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
 *       200:
 *         description: Список уроков модуля
 *       404:
 *         description: Модуль не найден
 */
export {};
