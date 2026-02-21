/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     summary: Получить урок по ID
 *     tags: [Student-Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID урока
 *     responses:
 *       200:
 *         description: Данные урока
 *       404:
 *         description: Урок не найден
 */
export {};
