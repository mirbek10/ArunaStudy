/**
 * @swagger
 * /api/lessons/{lessonId}/test:
 *   get:
 *     summary: Получить вопросы теста по уроку
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
 *         description: Вопросы теста
 *       404:
 *         description: Урок не найден
 */
export {};
