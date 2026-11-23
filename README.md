# Finance Tracker RESTful API

RESTful API backend for personal finance management built with TypeScript, Express 5, and Prisma ORM.

## Project Structure

```
FinanceTracker/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── error/
│   │   └── response.error.ts
│   ├── middleware/
│   │   └── error.middleware.ts
│   ├── web/
│   │   ├── database.ts
│   │   ├── logging.ts
│   │   └── main.ts
│   └── index.ts
├── test.http
├── tsconfig.json
└── package.json
```

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript
npm start        # Run production build
```
