/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Создать модуль (admin)
 *     tags: [Admin-Modules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, order]
 *             additionalProperties: false
 *             properties:
 *               title:
 *                 type: string
 *                 example: React
 *               description:
 *                 type: string
 *                 example: Компоненты, state, props
 *               order:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Модуль создан
 *       403:
 *         description: Нет прав
 */
export {};
