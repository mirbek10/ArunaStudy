/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Обновить профиль текущего пользователя
 *     tags: [Student-Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               name:
 *                 type: string
 *                 example: Student Updated
 *               email:
 *                 type: string
 *                 example: student.updated@example.com
 *               password:
 *                 type: string
 *                 example: NewStrongPass123!
 *     responses:
 *       200:
 *         description: Профиль обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/UserPublic'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Требуется авторизация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email уже занят
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
