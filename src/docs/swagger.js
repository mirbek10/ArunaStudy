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
      { name: 'Student-Sections', description: 'Запросы студента по разделам' },
      { name: 'Student-Modules', description: 'Запросы студента по модулям' },
      { name: 'Admin-Modules', description: 'Запросы админа по модулям' },
      { name: 'Student-Lessons', description: 'Запросы студента по урокам и тестам' },
      { name: 'Admin-Lessons', description: 'Запросы админа по урокам' },
      { name: 'Student-Practices', description: 'Запросы студента по практикам' },
      { name: 'Admin-Practices', description: 'Запросы админа по практикам' },
      { name: 'Student-Progress', description: 'Запросы студента по прогрессу' },
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
            message: { type: 'string', example: 'Ошибка запроса' }
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
            title: { type: 'string', example: 'HTML/CSS' },
            description: { type: 'string', example: 'Semantic HTML, CSS layouts' },
            order: { type: 'integer', example: 1 }
          }
        },
        Section: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 11 },
            title: { type: 'string', example: 'HTML/CSS' },
            description: { type: 'string', example: 'Semantic HTML, CSS layouts' },
            order: { type: 'integer', example: 1 },
            lessonsCount: { type: 'integer', example: 2 }
          }
        },
        LessonQuestion: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 501 },
            question: { type: 'string', example: 'Main HTML heading tag?' },
            options: {
              type: 'array',
              items: { type: 'string' },
              minItems: 4,
              example: ['h1', 'h2', 'title', 'head']
            },
            correctOptionIndex: { type: 'integer', example: 0 }
          }
        },
        Lesson: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 101 },
            moduleId: { type: 'integer', example: 11 },
            title: { type: 'string', example: 'HTML Structure' },
            content: { type: 'string', example: 'Build semantic page structure.' },
            videoUrl: { type: 'string', example: 'https://www.youtube.com/watch?v=qz0aGYrrlhU' },
            order: { type: 'integer', example: 1 },
            passingScore: { type: 'integer', example: 80 },
            test: {
              type: 'array',
              items: { $ref: '#/components/schemas/LessonQuestion' }
            }
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
            reviewerId: { type: 'integer', nullable: true, example: null },
            createdAt: { type: 'string', example: '2026-02-21T10:00:00.000Z' },
            reviewedAt: { type: 'string', nullable: true, example: null }
          }
        }
      }
    }
  },
  apis: ['./src/docs/endpoints/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
