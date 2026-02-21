/**
 * @swagger
 * /api/sections:
 *   get:
 *     summary: Получить список разделов (HTML/CSS, JS, React и т.д.)
 *     tags: [Student-Sections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список разделов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sections:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Section'
 *       401:
 *         description: Не авторизован
 */
export {};
