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
 *                 $ref: '#/components/schemas/LocalizedText'
 *               content:
 *                 $ref: '#/components/schemas/LocalizedText'
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
 *                   additionalProperties: false
 *                   required: [question, options, correctOptionIndex]
 *                   properties:
 *                     id:
 *                       type: integer
 *                     question:
 *                       $ref: '#/components/schemas/LocalizedText'
 *                     options:
 *                       type: array
 *                       minItems: 4
 *                       items:
 *                         $ref: '#/components/schemas/LocalizedText'
 *                     correctOptionIndex:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Урок обновлен
 *       404:
 *         description: Урок не найден
 */
export {};
