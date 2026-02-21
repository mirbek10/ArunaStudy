/**
 * @swagger
 * /api/lessons/{lessonId}/test/submit:
 *   post:
 *     summary: Отправить ответы теста урока
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             additionalProperties: false
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId, selectedOptionIndex]
 *                   additionalProperties: false
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                       example: 501
 *                     selectedOptionIndex:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Результат теста
 *       423:
 *         description: Урок заблокирован
 */
export {};
