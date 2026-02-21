/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Получить список модулей
 *     tags: [Student-Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: withLessons
 *         schema:
 *           type: string
 *           enum: ['1']
 *         required: false
 *         description: Вернуть модули вместе с уроками
 *     responses:
 *       200:
 *         description: Список модулей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Module'
 *       401:
 *         description: Не авторизован
 */
export {};
