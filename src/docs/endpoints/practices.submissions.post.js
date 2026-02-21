/**
 * @swagger
 * /api/practices/submissions:
 *   post:
 *     summary: Отправить практическую работу
 *     tags: [Student-Practices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId]
 *             additionalProperties: false
 *             properties:
 *               lessonId:
 *                 type: integer
 *                 example: 101
 *               answerUrl:
 *                 type: string
 *                 example: https://github.com/user/repo
 *               answerText:
 *                 type: string
 *                 example: Мое решение практики
 *     responses:
 *       201:
 *         description: Практика отправлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submission:
 *                   $ref: '#/components/schemas/PracticeSubmission'
 *       404:
 *         description: Урок не найден
 */
export {};
