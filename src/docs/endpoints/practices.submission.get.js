/**
 * @swagger
 * /api/practices/submissions/{submissionId}:
 *   get:
 *     summary: Get practice submission by id
 *     tags: [Student-Practices, Admin-Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Practice submission id
 *     responses:
 *       200:
 *         description: Practice submission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submission:
 *                   $ref: '#/components/schemas/PracticeSubmission'
 *       400:
 *         description: Invalid submissionId
 *       403:
 *         description: No access
 *       404:
 *         description: Submission not found
 */
export {};
