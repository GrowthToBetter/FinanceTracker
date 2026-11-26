import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Tracker RESTful API",
      version: "1.0.0",
      description:
        "RESTful API documentation for Finance Tracker built with Express, TypeScript, and Prisma",
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
                createdAt: {
                  type: "string",
                  example: "2026-11-23T10:00:00.000Z",
                },
              },
            },
            message: {
              type: "string",
              example: "User registered successfully",
            },
          },
        },
        UserLoginResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "e8b23f82-a7d5-4a8a-9e5b-38dcfb940e71",
                },
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
                createdAt: {
                  type: "string",
                  example: "2026-11-23T10:15:00.000Z",
                },
                updatedAt: {
                  type: "string",
                  example: "2026-11-23T10:15:00.000Z",
                },
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
                  createdAt: {
                    type: "string",
                    example: "2026-11-23T10:15:00.000Z",
                  },
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
                createdAt: {
                  type: "string",
                  example: "2026-11-23T10:00:00.000Z",
                },
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
                  createdAt: {
                    type: "string",
                    example: "2026-11-23T10:00:00.000Z",
                  },
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
        TransactionCreateRequest: {
          type: "object",
          required: ["fromWalletId", "type", "amount"],
          properties: {
            fromWalletId: { type: "integer", example: 1 },
            categoryId: { type: "integer", example: 2 },
            type: {
              type: "string",
              enum: ["INCOME", "EXPENSE"],
              example: "EXPENSE",
            },
            amount: { type: "integer", example: 250000 },
            note: { type: "string", example: "Supermarket groceries" },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-11-23T12:00:00.000Z",
            },
          },
        },
        TransactionTransferRequest: {
          type: "object",
          required: ["fromWalletId", "toWalletId", "amount"],
          properties: {
            fromWalletId: { type: "integer", example: 1 },
            toWalletId: { type: "integer", example: 3 },
            amount: { type: "integer", example: 500000 },
            note: { type: "string", example: "Top up GoPay from BCA" },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-11-23T12:15:00.000Z",
            },
          },
        },
        TransactionResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 201 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                userId: { type: "integer", example: 1 },
                fromWalletId: { type: "integer", example: 1 },
                toWalletId: { type: "integer", nullable: true, example: null },
                categoryId: { type: "integer", nullable: true, example: 2 },
                type: { type: "string", example: "EXPENSE" },
                status: { type: "string", example: "POSTED" },
                amount: { type: "integer", example: 250000 },
                note: {
                  type: "string",
                  nullable: true,
                  example: "Supermarket groceries",
                },
                idempotencyKey: {
                  type: "string",
                  nullable: true,
                  example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                },
                date: { type: "string", example: "2026-11-23T12:00:00.000Z" },
                createdAt: {
                  type: "string",
                  example: "2026-11-23T12:00:00.000Z",
                },
                updatedAt: {
                  type: "string",
                  example: "2026-11-23T12:00:00.000Z",
                },
              },
            },
            message: { type: "string", example: "Create transaction success" },
          },
        },
        TransactionListResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  fromWalletId: { type: "integer", example: 1 },
                  toWalletId: {
                    type: "integer",
                    nullable: true,
                    example: null,
                  },
                  categoryId: { type: "integer", nullable: true, example: 2 },
                  type: { type: "string", example: "EXPENSE" },
                  status: { type: "string", example: "POSTED" },
                  amount: { type: "integer", example: 250000 },
                  note: {
                    type: "string",
                    nullable: true,
                    example: "Supermarket groceries",
                  },
                  date: { type: "string", example: "2026-11-23T12:00:00.000Z" },
                },
              },
            },
            paging: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                size: { type: "integer", example: 10 },
                total_page: { type: "integer", example: 1 },
                total_items: { type: "integer", example: 2 },
              },
            },
            message: { type: "string", example: "Get transactions success" },
          },
        },
        TransactionVoidResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                status: { type: "string", example: "VOIDED" },
                updatedAt: {
                  type: "string",
                  example: "2026-11-23T12:30:00.000Z",
                },
              },
            },
            message: {
              type: "string",
              example: "Transaction voided successfully",
            },
          },
        },
        BudgetCreateRequest: {
          type: "object",
          required: ["categoryId", "amount", "month", "year"],
          properties: {
            categoryId: { type: "integer", example: 1 },
            amount: { type: "integer", example: 3000000 },
            month: { type: "integer", example: 11 },
            year: { type: "integer", example: 2026 },
          },
        },
        BudgetUpdateRequest: {
          type: "object",
          required: ["amount"],
          properties: {
            amount: { type: "integer", example: 3500000 },
          },
        },
        BudgetResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 201 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                userId: { type: "integer", example: 1 },
                categoryId: { type: "integer", example: 1 },
                amount: { type: "integer", example: 3000000 },
                month: { type: "integer", example: 11 },
                year: { type: "integer", example: 2026 },
                createdAt: { type: "string", example: "2026-11-23T10:00:00.000Z" },
                updatedAt: { type: "string", example: "2026-11-23T10:00:00.000Z" },
              },
            },
            message: { type: "string", example: "Create budget success" },
          },
        },
        BudgetListResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  categoryId: { type: "integer", example: 1 },
                  categoryName: { type: "string", example: "Food, Drinks & Dining" },
                  amount: { type: "integer", example: 3000000 },
                  usedAmount: { type: "integer", example: 2450000 },
                  percentageUsed: { type: "number", example: 81.67 },
                  month: { type: "integer", example: 11 },
                  year: { type: "integer", example: 2026 },
                },
              },
            },
            message: { type: "string", example: "Get budgets success" },
          },
        },
        BudgetDetailResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                userId: { type: "integer", example: 1 },
                categoryId: { type: "integer", example: 1 },
                amount: { type: "integer", example: 3000000 },
                usedAmount: { type: "integer", example: 2450000 },
                remainingAmount: { type: "integer", example: 550000 },
                percentageUsed: { type: "number", example: 81.67 },
                month: { type: "integer", example: 11 },
                year: { type: "integer", example: 2026 },
                createdAt: { type: "string", example: "2026-11-23T10:00:00.000Z" },
                updatedAt: { type: "string", example: "2026-11-23T10:00:00.000Z" },
              },
            },
            message: { type: "string", example: "Get budget detail success" },
          },
        },
        BudgetDeleteResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
              },
            },
            message: { type: "string", example: "Delete budget success" },
          },
        },
        NotificationListResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  message: {
                    type: "string",
                    example: "Warning: Food, Drinks & Dining budget reached 81.67% of monthly limit",
                  },
                  isRead: { type: "boolean", example: false },
                  createdAt: { type: "string", example: "2026-11-23T12:00:00.000Z" },
                },
              },
            },
            message: { type: "string", example: "Get notifications success" },
          },
        },
        NotificationReadResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                isRead: { type: "boolean", example: true },
              },
            },
            message: { type: "string", example: "Notification marked as read" },
          },
        },
        DashboardSummaryResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "object",
              properties: {
                totalBalance: { type: "integer", example: 11100000 },
                monthlyIncome: { type: "integer", example: 15000000 },
                monthlyExpense: { type: "integer", example: 4250000 },
                walletsCount: { type: "integer", example: 3 },
                activeBudgetsCount: { type: "integer", example: 2 },
                wallets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "BCA Payroll Account" },
                      type: {
                        type: "string",
                        enum: ["CASH", "BANK", "EWALLET", "SAVINGS"],
                        example: "BANK",
                      },
                      balance: { type: "integer", example: 10000000 },
                    },
                  },
                },
              },
            },
            message: {
              type: "string",
              example: "Get dashboard summary success",
            },
          },
        },
        DashboardCashflowResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", example: "2026-11-22" },
                  income: { type: "integer", example: 15000000 },
                  expense: { type: "integer", example: 600000 },
                  net: { type: "integer", example: 14400000 },
                },
              },
            },
            message: {
              type: "string",
              example: "Get cashflow trends success",
            },
          },
        },
      },
    },
  },
  apis: ["./src/route/*.ts", "./src/route/*.js", "./dist/route/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
