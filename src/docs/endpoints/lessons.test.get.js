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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessonId:
 *                   type: integer
 *                 unlocked:
 *                   type: boolean
 *                 passingScore:
 *                   type: integer
 *                 isRequired:
 *                   type: boolean
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       question:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                         minItems: 4
 *       404:
 *         description: Урок не найден
 */
export {};
