/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   delete:
 *     summary: Удалить урок (admin)
 *     tags: [Admin-Lessons]
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
 *       204:
 *         description: Урок удален
 *       404:
 *         description: Урок не найден
 */
export {};
