import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const moduleCreateSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  order: z.number().int().min(1)
});

export const moduleUpdateSchema = moduleCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required'
);

const testQuestionSchema = z.object({
  question: z.string().min(3),
  correctAnswer: z.string().min(1)
});

export const lessonCreateSchema = z.object({
  moduleId: z.number().int().min(1),
  title: z.string().min(2),
  content: z.string().min(10),
  videoUrl: z.string().url().optional(),
  order: z.number().int().min(1),
  passingScore: z.number().int().min(0).max(100).default(80),
  test: z.array(testQuestionSchema).min(1)
});

export const lessonUpdateSchema = lessonCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required'
);

export const testSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int().min(1),
      answer: z.string().min(1)
    })
  )
});

export const practiceSubmitSchema = z
  .object({
    lessonId: z.number().int().min(1),
    answerUrl: z.string().url().optional(),
    answerText: z.string().min(3).optional()
  })
  .refine((value) => value.answerUrl || value.answerText, {
    message: 'answerUrl or answerText is required'
  });

export const practiceReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().min(2)
});

export const lessonAccessUpdateSchema = z.object({
  hasLessonsAccess: z.boolean()
});
