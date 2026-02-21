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
 *       401:
 *         description: Не авторизован
 */
export {};
