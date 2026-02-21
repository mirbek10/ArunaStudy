/**
 * @swagger
 * /api/practices/submissions/{submissionId}/review:
 *   patch:
 *     summary: Проверить практику (admin)
 *     tags: [Admin-Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID отправки практики
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, feedback]
 *             additionalProperties: false
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *               feedback:
 *                 type: string
 *                 example: Отличная работа
 *     responses:
 *       200:
 *         description: Практика проверена
 *       404:
 *         description: Отправка не найдена
 */
export {};
