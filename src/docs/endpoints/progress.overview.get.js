/**
 * @swagger
 * /api/progress/overview:
 *   get:
 *     summary: Получить общий прогресс
 *     tags: [Student-Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Общий прогресс студента
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overallPercent:
 *                   type: integer
 *                   example: 57
 *                 completedLessons:
 *                   type: integer
 *                   example: 8
 *                 totalLessons:
 *                   type: integer
 *                   example: 14
 *                 completedRequiredLessons:
 *                   type: integer
 *                   example: 8
 *                 totalRequiredLessons:
 *                   type: integer
 *                   example: 14
 *                 completedOptionalLessons:
 *                   type: integer
 *                   example: 3
 *                 totalOptionalLessons:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Не авторизован
 */
export {};
