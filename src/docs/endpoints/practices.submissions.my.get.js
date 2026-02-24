/**
 * @swagger
 * /api/practices/submissions/my:
 *   get:
 *     summary: Get current student practice submissions
 *     tags: [Student-Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: lessonId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by lesson id
 *     responses:
 *       200:
 *         description: Student practice submissions list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PracticeSubmission'
 *       400:
 *         description: Invalid query params
 *       403:
 *         description: No permissions
 */
export {};
