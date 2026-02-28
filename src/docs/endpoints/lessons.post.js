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
 *                 $ref: '#/components/schemas/LocalizedText'
 *               content:
 *                 $ref: '#/components/schemas/LocalizedText'
 *               videoUrl:
 *                 type: string
 *                 example: https://www.youtube.com/watch?v=qz0aGYrrlhU
 *               order:
 *                 type: integer
 *                 example: 1
 *               passingScore:
 *                 type: integer
 *                 example: 80
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *               test:
 *                 type: array
 *                 items:
 *                   type: object
 *                   additionalProperties: false
 *                   required: [question, options, correctOptionIndex]
 *                   properties:
 *                     question:
 *                       $ref: '#/components/schemas/LocalizedText'
 *                     options:
 *                       type: array
 *                       minItems: 4
 *                       items:
 *                         $ref: '#/components/schemas/LocalizedText'
 *                     correctOptionIndex:
 *                       type: integer
 *                       example: 0
 *     responses:
 *       201:
 *         description: Урок создан
 *       404:
 *         description: Модуль не найден
 */
export {};
