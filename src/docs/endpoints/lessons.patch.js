/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   patch:
 *     summary: Обновить урок (admin)
 *     tags: [Admin-Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID урока
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               moduleId:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               order:
 *                 type: integer
 *               passingScore:
 *                 type: integer
 *               test:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Урок обновлен
 *       404:
 *         description: Урок не найден
 */
export {};
