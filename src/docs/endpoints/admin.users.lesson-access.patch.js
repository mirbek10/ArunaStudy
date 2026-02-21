/**
 * @swagger
 * /api/admin/users/{userId}/lesson-access:
 *   patch:
 *     summary: Обновить доступ студента к урокам (admin)
 *     tags: [Admin-Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hasLessonsAccess]
 *             additionalProperties: false
 *             properties:
 *               hasLessonsAccess:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Флаг доступа обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: Student
 *                     email:
 *                       type: string
 *                       example: student@arunastudy.com
 *                     role:
 *                       type: string
 *                       enum: [admin, student]
 *                       example: student
 *                     hasLessonsAccess:
 *                       type: boolean
 *                       example: true
 *                 hasLessonsAccess:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Некорректные данные или пользователь не студент
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Пользователь не найден
 */
export {};
