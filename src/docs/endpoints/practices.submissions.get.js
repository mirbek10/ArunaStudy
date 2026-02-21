/**
 * @swagger
 * /api/practices/submissions:
 *   get:
 *     summary: Получить отправленные практики (admin)
 *     tags: [Admin-Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: Список отправленных практик
 *       403:
 *         description: Нет прав
 */
export {};
