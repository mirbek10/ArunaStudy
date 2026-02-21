/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Показатели админ-дашборда
 *     tags: [Admin-Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Метрики панели администратора
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studentsCount:
 *                   type: integer
 *                   example: 120
 *                 modulesCount:
 *                   type: integer
 *                   example: 7
 *                 lessonsCount:
 *                   type: integer
 *                   example: 14
 *                 pendingPractices:
 *                   type: integer
 *                   example: 9
 *       403:
 *         description: Нет прав
 */
export {};
