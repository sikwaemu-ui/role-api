Good. Now we move to **Step 3 — connect Prisma to our Express application**.

We already have:

```text
Node.js
Express
TypeScript
dotenv
Nodemon
Prisma
Neon PostgreSQL
```

Now we need to make Prisma usable inside our application.

## 3.1 Create the database folder

Run:

```bash
mkdir -p src/db
touch src/db/prisma.ts
```

Your structure becomes:

```text
auth-api/
├── src/
│   ├── db/
│   │   └── prisma.ts
│   └── server.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── generated/
│   └── prisma/
│
├── .env
├── nodemon.json
├── prisma.config.ts
├── package.json
└── tsconfig.json
```

---

# 3.2 Create the Prisma client

Open:

```text
src/db/prisma.ts
```

Add:

```typescript
import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

This gives the rest of our application one Prisma client that we can import whenever we need to communicate with PostgreSQL.

Conceptually:

```text
Controller
    ↓
Service
    ↓
Prisma Client
    ↓
Neon
    ↓
PostgreSQL
```

---

# 3.3 Test the database connection

Let's temporarily modify `server.ts`.

```typescript
import express from "express";
import dotenv from "dotenv";
import prisma from "./db/prisma.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Auth API is running"
  });
});

app.get("/api/db-test", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Database connection successful"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

Notice this line:

```typescript
await prisma.$queryRaw`SELECT 1`;
```

We're not querying our `User` table yet.

We're simply asking PostgreSQL:

> "Are you there?"

---

# 3.4 Run the server

```bash
npm run dev
```

Then visit:

```text
http://localhost:5000/api/db-test
```

You should get:

```json
{
  "success": true,
  "message": "Database connection successful"
}
```

If you get this, we have successfully established:

```text
Browser
   ↓
Express
   ↓
Prisma
   ↓
Neon
   ↓
PostgreSQL
```

That's an important milestone.

---

# 3.5 One thing I want us to change

We're currently putting everything inside `server.ts`.

That's fine for testing, but **we shouldn't continue doing that**.

Our authentication API will eventually have:

```text
src/
├── controllers/
├── db/
├── middleware/
├── routes/
├── schemas/
├── services/
├── utils/
├── app.ts
└── server.ts
```

The distinction between `app.ts` and `server.ts` is useful:

```text
app.ts
  ↓
Express configuration
routes
middleware
error handling

server.ts
  ↓
Starts the HTTP server
```

So let's establish that architecture now.

---

# 3.6 Create `app.ts`

Run:

```bash
touch src/app.ts
```

Move our Express configuration into it:

```typescript
import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Auth API is running"
  });
});

app.get("/api/db-test", async (_req, res) => {
  res.json({
    success: true,
    message: "Database test endpoint"
  });
});

export default app;
```

We'll temporarily remove the actual Prisma test from here. We'll properly organize database testing once we introduce services.

---

# 3.7 Simplify `server.ts`

Now `server.ts` becomes:

```typescript
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

Now the responsibilities are clear:

```text
server.ts
    │
    └── Start server


app.ts
    │
    ├── Express
    ├── Middleware
    └── Routes
```

---

# 3.8 Why we're doing this now

This might seem like unnecessary structure for a tiny API.

But imagine six months from now:

```text
50 endpoints
20 controllers
15 services
10 schemas
8 middleware functions
```

If everything lives in `server.ts`, it becomes a mess.

We're establishing good architecture **before** the application becomes complicated.

---

# Next: Registration

Now we're ready for the first genuinely useful feature.

We'll install:

```bash
npm install bcryptjs
```

Then we'll create:

```text
POST /api/auth/register
```

The request:

```json
{
  "name": "Sikwa",
  "email": "sikwa@example.com",
  "password": "Password123"
}
```

will go through:

```text
Request
   ↓
Route
   ↓
Zod validation
   ↓
Controller
   ↓
Auth service
   ↓
bcrypt
   ↓
Prisma
   ↓
PostgreSQL
```

And PostgreSQL will contain something like:

```text
id:       1
name:     Sikwa
email:    sikwa@example.com
password: $2b$12$...
role:     USER
```

**Before we implement registration, run `/api/health` and confirm the server still starts. Then we'll build the registration endpoint from scratch, including the Zod validation and bcrypt hashing.**
