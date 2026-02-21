/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Проверка состояния сервера
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Сервер доступен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
export {};
