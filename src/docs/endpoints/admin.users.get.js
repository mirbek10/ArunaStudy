/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Получить всех пользователей (admin)
 *     tags: [Admin-Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей с флагом доступа к урокам
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: Student
 *                       email:
 *                         type: string
 *                         example: student@arunastudy.com
 *                       role:
 *                         type: string
 *                         enum: [admin, student]
 *                         example: student
 *                       hasLessonsAccess:
 *                         type: boolean
 *                         example: false
 *       403:
 *         description: Нет прав
 */
export {};
