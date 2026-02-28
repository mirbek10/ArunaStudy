import { z } from 'zod';

const localizedTextSchema = z.object({
  ru: z.string().min(1),
  ky: z.string().min(1)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const profileUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional()
  })
  .refine((value) => Object.keys(value).length > 0, 'Нужно передать хотя бы одно поле');

export const moduleCreateSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  order: z.number().int().min(1)
});

export const moduleUpdateSchema = moduleCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Нужно передать хотя бы одно поле'
);

const testQuestionSchema = z
  .object({
    id: z.number().int().min(1).optional(),
    question: localizedTextSchema,
    options: z.array(localizedTextSchema).min(4),
    correctOptionIndex: z.number().int().min(0)
  })
  .refine((value) => value.correctOptionIndex < value.options.length, {
    message: 'Индекс правильного варианта должен указывать на существующую опцию'
  });

export const lessonCreateSchema = z.object({
  moduleId: z.number().int().min(1),
  title: localizedTextSchema,
  content: localizedTextSchema,
  videoUrl: z.string().url().optional(),
  order: z.number().int().min(1),
  passingScore: z.number().int().min(0).max(100).default(80),
  test: z.array(testQuestionSchema).min(1)
});

export const lessonUpdateSchema = lessonCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Нужно передать хотя бы одно поле'
);

export const testSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int().min(1),
      selectedOptionIndex: z.number().int().min(0)
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
    message: 'Нужно передать ссылку на ответ или текст ответа'
  });

export const practiceReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().min(2)
});

export const lessonAccessUpdateSchema = z.object({
  hasLessonsAccess: z.boolean()
});

