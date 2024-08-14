// Change the file extension to .ts and add types
import swaggerJsDoc from 'swagger-jsdoc';

interface SwaggerOptions {
  definition: any; 
  apis: string[];
}

const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Demo Wallet App API',
      version: '1.0.0',
      description: 'APIs for managing users and transactions.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local server', 
      },
      {
        url: 'https://demo-credit-wallet-pp6p.onrender.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
    },
  },
    apis: ['./src/routes/*.ts'],
};

export default swaggerJsDoc(options);
