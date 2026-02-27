/**
 * @swagger
 * /api/lessons/{lessonId}/required:
 *   patch:
 *     summary: Update lesson isRequired only (admin)
 *     tags: [Admin-Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isRequired]
 *             additionalProperties: false
 *             properties:
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Lesson isRequired updated
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Lesson not found
 */
export {};
