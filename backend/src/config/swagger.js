const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spreetail HR Portal API',
      version: '1.0.0',
      description:
        'REST API for the Spreetail Employee Management Portal: authentication, employees, attendance, leave, payroll, performance, announcements, reports, and notifications.',
    },
    servers: [
      { url: '/api', description: 'Current server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth' },
      { name: 'Employees' },
      { name: 'Departments' },
      { name: 'Attendance' },
      { name: 'Leaves' },
      { name: 'Payroll' },
      { name: 'Performance' },
      { name: 'Announcements' },
      { name: 'Dashboard' },
      { name: 'Reports' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
