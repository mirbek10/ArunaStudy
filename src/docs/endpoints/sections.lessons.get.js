/**
 * @swagger
 * /api/sections/{sectionId}/lessons:
 *   get:
 *     summary: Получить уроки выбранного раздела
 *     tags: [Student-Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID раздела
 *     responses:
 *       200:
 *         description: Раздел и его уроки (с видео)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 section:
 *                   $ref: '#/components/schemas/Section'
 *                 lessons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Раздел не найден
 */
export {};
