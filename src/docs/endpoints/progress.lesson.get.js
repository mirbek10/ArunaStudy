/**
 * @swagger
 * /api/progress/lessons/{lessonId}:
 *   get:
 *     summary: Получить прогресс по конкретному уроку
 *     tags: [Student-Progress]
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
 *         description: Прогресс по уроку
 *       404:
 *         description: Урок не найден
 */
export {};
