import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API платформы arunastudy',
      version: '1.0.0',
      description: 'Express API для LMS arunastudy (in-memory, без базы данных)'
    },
    servers: [{ url: '/' }],
    tags: [
      { name: 'Health', description: 'Проверка состояния API' },
      { name: 'Public-Auth', description: 'Публичная аутентификация' },
      // { name: 'Student-Auth', description: 'Запросы текущего пользователя по авторизации' },
      { name: 'Student-Sections', description: 'Запросы студента по разделам' },
      { name: 'Student-Modules', description: 'Запросы студента по модулям' },
      { name: 'Admin-Modules', description: 'Запросы админа по модулям' },
      { name: 'Student-Lessons', description: 'Запросы студента по урокам и тестам' },
      { name: 'Admin-Lessons', description: 'Запросы админа по урокам' },
      { name: 'Student-Practices', description: 'Запросы студента по практикам' },
      { name: 'Admin-Practices', description: 'Запросы админа по практикам' },
      { name: 'Student-Progress', description: 'Запросы студента по прогрессу' },
      { name: 'Student-Profile', description: 'Запросы пользователя по своему профилю' },
      { name: 'Admin-Dashboard', description: 'Метрики админ-панели' },
      { name: 'Admin-Users', description: 'Запросы админа по пользователям и доступам к урокам' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { $ref: '#/components/schemas/LocalizedText' }
          }
        },
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Admin' },
            email: { type: 'string', example: 'admin@arunastudy.com' },
            role: { type: 'string', enum: ['admin', 'student'], example: 'admin' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/UserPublic' }
          }
        },
        LocalizedText: {
          type: 'object',
          required: ['ru', 'ky'],
          properties: {
            ru: { type: 'string', example: 'Заголовок' },
            ky: { type: 'string', example: 'Аталышы' }
          }
        },
        Module: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 11 },
            title: { $ref: '#/components/schemas/LocalizedText' },
            description: { $ref: '#/components/schemas/LocalizedText' },
            order: { type: 'integer', example: 1 }
          }
        },
        Section: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 11 },
            title: { $ref: '#/components/schemas/LocalizedText' },
            description: { $ref: '#/components/schemas/LocalizedText' },
            order: { type: 'integer', example: 1 },
            lessonsCount: { type: 'integer', example: 2 }
          }
        },
        LessonQuestion: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 501 },
            question: { $ref: '#/components/schemas/LocalizedText' },
            options: {
              type: 'array',
              items: { $ref: '#/components/schemas/LocalizedText' },
              minItems: 4,
              example: [
                { ru: 'h1', ky: 'h1' },
                { ru: 'h2', ky: 'h2' },
                { ru: 'title', ky: 'title' },
                { ru: 'head', ky: 'head' }
              ]
            },
            correctOptionIndex: { type: 'integer', example: 0 }
          }
        },
        Lesson: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 101 },
            moduleId: { type: 'integer', example: 11 },
            title: { $ref: '#/components/schemas/LocalizedText' },
            content: { $ref: '#/components/schemas/LocalizedText' },
            videoUrl: { type: 'string', example: 'https://www.youtube.com/watch?v=qz0aGYrrlhU' },
            order: { type: 'integer', example: 1 },
            passingScore: { type: 'integer', example: 80 },
            isRequired: { type: 'boolean', example: true },
            test: {
              type: 'array',
              items: { $ref: '#/components/schemas/LessonQuestion' }
            }
          }
        },
        PracticeReviewEntry: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
            feedback: { type: 'string', example: 'Отличная работа' },
            reviewerId: { type: 'integer', nullable: true, example: 1 },
            reviewedAt: { type: 'string', example: '2026-02-21T10:00:00.000Z' }
          }
        },
        PracticeSubmission: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1201 },
            studentId: { type: 'integer', example: 2 },
            lessonId: { type: 'integer', example: 101 },
            answerUrl: { type: 'string', example: 'https://github.com/user/repo' },
            answerText: { type: 'string', example: 'Решение по практике' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            feedback: { type: 'string', example: 'Хорошая работа' },
            reviewHistory: {
              type: 'array',
              items: { $ref: '#/components/schemas/PracticeReviewEntry' }
            },
            reviewerId: { type: 'integer', nullable: true, example: null },
            createdAt: { type: 'string', example: '2026-02-21T10:00:00.000Z' },
            reviewedAt: { type: 'string', nullable: true, example: null },
            student: { allOf: [{ $ref: '#/components/schemas/UserPublic' }], nullable: true },
            reviewer: { allOf: [{ $ref: '#/components/schemas/UserPublic' }], nullable: true },
            lesson: { allOf: [{ $ref: '#/components/schemas/Lesson' }], nullable: true }
          }
        }
      }
    }
  },
  apis: ['./src/docs/endpoints/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
