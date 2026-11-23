import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Tracker RESTful API",
      version: "1.0.0",
      description: "RESTful API documentation for Finance Tracker built with Express, TypeScript, and Prisma",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
        },
      },
      schemas: {
        UserRegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jean R" },
            email: { type: "string", example: "jean@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        UserLoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "jean@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 201 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Jean R" },
                email: { type: "string", example: "jean@example.com" },
                createdAt: { type: "string", example: "2026-11-23T10:00:00.000Z" },
              },
            },
            message: { type: "string", example: "User registered successfully" },
          },
        },
        UserLoginResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                token: { type: "string", example: "e8b23f82-a7d5-4a8a-9e5b-38dcfb940e71" },
              },
            },
            message: { type: "string", example: "Login successful" },
          },
        },
        WalletCreateRequest: {
          type: "object",
          required: ["name", "type"],
          properties: {
            name: { type: "string", example: "BCA Main Account" },
            type: {
              type: "string",
              enum: ["CASH", "BANK", "EWALLET", "SAVINGS"],
              example: "BANK",
            },
            balance: { type: "integer", example: 10000000 },
          },
        },
        WalletUpdateRequest: {
          type: "object",
          properties: {
            name: { type: "string", example: "BCA Payroll Account" },
            type: {
              type: "string",
              enum: ["CASH", "BANK", "EWALLET", "SAVINGS"],
              example: "BANK",
            },
          },
        },
        WalletResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                userId: { type: "integer", example: 1 },
                name: { type: "string", example: "BCA Main Account" },
                type: { type: "string", example: "BANK" },
                balance: { type: "integer", example: 10000000 },
                createdAt: { type: "string", example: "2026-11-23T10:15:00.000Z" },
                updatedAt: { type: "string", example: "2026-11-23T10:15:00.000Z" },
              },
            },
            message: { type: "string", example: "Create wallet success" },
          },
        },
        WalletListResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  name: { type: "string", example: "BCA Main Account" },
                  type: { type: "string", example: "BANK" },
                  balance: { type: "integer", example: 10000000 },
                  createdAt: { type: "string", example: "2026-11-23T10:15:00.000Z" },
                },
              },
            },
            message: { type: "string", example: "Get wallets success" },
          },
        },
        CategoryCreateRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Food & Beverage" },
          },
        },
        CategoryUpdateRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Food, Drinks & Dining" },
          },
        },
        CategoryResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 201 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Food & Beverage" },
                createdAt: { type: "string", example: "2026-11-23T10:00:00.000Z" },
              },
            },
            message: { type: "string", example: "Create category success" },
          },
        },
        CategoryUpdateResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Food, Drinks & Dining" },
              },
            },
            message: { type: "string", example: "Update category success" },
          },
        },
        CategoryListResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  name: { type: "string", example: "Food & Beverage" },
                  createdAt: { type: "string", example: "2026-11-23T10:00:00.000Z" },
                },
              },
            },
            message: { type: "string", example: "Get categories success" },
          },
        },
        CategoryDeleteResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
              },
            },
            message: { type: "string", example: "Delete category success" },
          },
        },
        ErrorResponse400: {
          type: "object",
          properties: {
            status: { type: "integer", example: 400 },
            data: { type: "null", example: null },
            message: { type: "string", example: "Bad Request" },
          },
        },
        ErrorResponse401: {
          type: "object",
          properties: {
            status: { type: "integer", example: 401 },
            data: { type: "null", example: null },
            message: { type: "string", example: "Unauthorized" },
          },
        },
        ErrorResponse404: {
          type: "object",
          properties: {
            status: { type: "integer", example: 404 },
            data: { type: "null", example: null },
            message: { type: "string", example: "Resource not found" },
          },
        },
        ErrorResponse500: {
          type: "object",
          properties: {
            status: { type: "integer", example: 500 },
            data: { type: "null", example: null },
            message: { type: "string", example: "Internal Server Error" },
          },
        },
      },
    },
  },
  apis: ["./src/route/*.ts", "./src/route/*.js", "./dist/route/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
