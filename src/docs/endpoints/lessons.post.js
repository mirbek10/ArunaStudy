/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Создать урок (admin)
 *     tags: [Admin-Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moduleId, title, content, order, passingScore, test]
 *             additionalProperties: false
 *             properties:
 *               moduleId:
 *                 type: integer
 *                 example: 11
 *               title:
 *                 type: string
 *                 example: HTML Structure
 *               content:
 *                 type: string
 *                 example: Build semantic page structure.
 *               videoUrl:
 *                 type: string
 *                 example: https://www.youtube.com/watch?v=qz0aGYrrlhU
 *               order:
 *                 type: integer
 *                 example: 1
 *               passingScore:
 *                 type: integer
 *                 example: 80
 *               test:
 *                 type: array
 *                 items:
 *                   type: object
 *                   additionalProperties: false
 *                   required: [question, correctAnswer]
 *                   properties:
 *                     question:
 *                       type: string
 *                     correctAnswer:
 *                       type: string
 *     responses:
 *       201:
 *         description: Урок создан
 *       404:
 *         description: Модуль не найден
 */
export {};
