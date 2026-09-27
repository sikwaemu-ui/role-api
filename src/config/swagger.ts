import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Role API",
      version: "1.0.0",
      description:
        "Authentication and role-based authorization API built with Express, TypeScript, Prisma, and PostgreSQL.",
    },
    servers: [
      { url: "https://role-api-zlpr.onrender.com", description: "Production server" },
      { url: "http://localhost:5000", description: "Local development server" },
    ],
    tags: [
      { name: "Auth", description: "Registration, login, and current user" },
      { name: "User", description: "Authenticated user endpoints" },
      { name: "Admin", description: "Administrator-only endpoints" },
      { name: "System", description: "Health and database status" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Use the token returned by POST /api/auth/login.",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Invalid email address" },
          },
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["System"],
          summary: "Check API health",
          responses: { "200": { description: "API is running" } },
        },
      },
      "/api/db-test": {
        get: {
          tags: ["System"],
          summary: "Check database connectivity",
          responses: {
            "200": { description: "Database connection successful" },
            "500": { description: "Database connection failed" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/src/routes/*.js"],
};

const swaggerDocument = swaggerJSDoc(swaggerOptions);
export default swaggerDocument;
