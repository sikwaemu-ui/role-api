# role-api1

A REST API for user registration, login, JWT-authenticated requests, and role-based admin access, built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Overview

`role-api1` is a backend API that stores users in PostgreSQL. Express routes dispatch requests to authentication controllers or protected route handlers. Zod validates registration and login input, bcryptjs hashes passwords, and Prisma accesses the database through its PostgreSQL driver adapter.

Authentication uses signed JSON Web Tokens. The token contains a `userId` and expires after one day. The admin middleware checks the user's current role in PostgreSQL for each admin request; the role is not carried in the JWT.

Interactive API documentation is served by Swagger UI at `/api-docs`. The OpenAPI definition is assembled with `swagger-jsdoc` from route annotations and the Swagger configuration. The OpenAPI configuration lists the production URL `https://role-api-zlpr.onrender.com` and local URL `http://localhost:5000`.

The repository contains npm build and start scripts but no Render manifest, Dockerfile, or deployment pipeline configuration. The production URL above is explicitly configured in Swagger; deployment settings must be provided by the hosting environment.

## Features

- Register users with a name, email, and password.
- Log in with email and password and receive a one-day JWT.
- Protect endpoints using the `Authorization: Bearer <token>` header.
- Provide `USER` and `ADMIN` database roles; new registrations default to `USER`.
- Restrict the admin dashboard to users whose current database role is `ADMIN`.
- Validate registration and login bodies with Zod.
- Hash passwords with bcryptjs before storing them.
- Persist user data in PostgreSQL through Prisma.
- Serve an interactive Swagger UI and OpenAPI documentation.
- Provide API health and database connectivity endpoints.

## Technology Stack

Versions below are the dependency ranges declared in `package.json` (not necessarily the exact versions installed from the lockfile).

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime. Prisma 7.9.1 supports `^20.19`, `^22.12`, or `>=24`; swagger-jsdoc 6.3.0 requires Node.js 20 or newer. |
| Express `^5.2.1` | HTTP server, route mounting, and middleware. |
| TypeScript `^7.0.2` | Static typing and compilation to `dist/`. |
| PostgreSQL | Relational database provider configured in the Prisma schema. |
| Prisma `^7.9.1` | Schema, migration tooling, and generated typed database client. |
| `@prisma/adapter-pg` `^7.9.1` / `pg` `^8.23.0` | PostgreSQL driver adapter used by Prisma Client. |
| `jsonwebtoken` `^9.0.3` | Signs and verifies JWTs. |
| `bcryptjs` `^3.0.3` | Hashes and compares passwords. |
| Zod `^4.4.3` | Validates registration and login request bodies. |
| `swagger-jsdoc` `^6.3.0` | Builds an OpenAPI document from configuration and route annotations. |
| `swagger-ui-express` `^5.0.1` | Serves the interactive API documentation through Express. |
| `dotenv` `^17.4.2` | Loads local environment variables from `.env`. |
| `tsx` `^4.23.12` / Nodemon `^3.1.14` | Runs and restarts the TypeScript server during development. |

## Architecture

### Request flow

```text
HTTP request
    ↓
Express app (src/server.ts)
    ↓
Route group (src/routes/)
    ↓
Authentication / role middleware, when required
    ↓
Controller or route handler
    ↓
Prisma Client (src/db/prisma.ts)
    ↓
PostgreSQL
```

Not every request traverses every layer. The health check has no database access. Registration and login are handled by controllers. The profile and admin dashboard use inline route handlers after middleware.

### Responsibilities

- **`src/server.ts`** creates the Express app, enables JSON request parsing, mounts Swagger UI and routes, defines `/api/health` and `/api/db-test`, and starts the HTTP listener.
- **Routes** map URL paths to controller functions and middleware. Authentication routes are under `/api/auth`; user and admin routes are mounted under `/api/user` and `/api/admin`.
- **`src/controllers/auth.controller.ts`** contains registration, login, and current-user lookup logic.
- **Middleware** authenticates bearer tokens. The admin middleware separately looks up the user role before allowing access.
- **Schemas** in `src/schemas/auth.schema.ts` enforce the input constraints used by registration and login.
- **`src/utils/jwt.ts`** signs a token containing `userId`, with a one-day expiry.
- **`src/db/prisma.ts`** configures Prisma Client with `PrismaPg` and `DATABASE_URL`, then exports the shared client.
- **Prisma** generates the typed client from `prisma/schema.prisma` and applies the checked-in migrations to PostgreSQL.
- **Swagger** configuration lives in `src/config/swagger.ts`; OpenAPI annotations live beside the route definitions.

There is no centralized Express error-handling middleware. Controllers and the admin middleware handle their own errors and return JSON errors; Express's JSON parser and other framework-level errors are not normalized by a project-wide handler.

## Authentication and Authorization

Authentication answers “who is making this request?” Authorization answers “is this authenticated user allowed to do this?” This API handles them in separate middleware steps for the admin dashboard.

1. **Registration:** `POST /api/auth/register` validates the body. The controller checks whether the email is already present, hashes the password with bcryptjs using 12 rounds, and creates a user. The schema's default role is `USER`.
2. **Login:** `POST /api/auth/login` finds the user by email and compares the submitted password with its stored hash. If both match, the API signs and returns a JWT.
3. **Token contents and expiry:** The JWT payload contains `userId` and does not contain a role. `jsonwebtoken` also adds issued-at (`iat`) and expiry (`exp`) claims; the token expires after one day. `JWT_SECRET` is required for signing and verification.
4. **Bearer authentication:** Protected routes expect `Authorization: Bearer <token>`. The `authenticate` middleware verifies the token and puts its `userId` on `req.user`. Missing, malformed, invalid, or expired tokens receive HTTP 401.
5. **Current user:** `GET /api/auth/me` uses the token's ID to query PostgreSQL and returns the user's public fields. The password hash is excluded. If the user no longer exists, it returns HTTP 401.
6. **Role authorization:** `GET /api/admin/dashboard` runs `authenticate`, then `requireAdmin`. The latter queries PostgreSQL for the current role. A missing user receives HTTP 401; a user without the `ADMIN` role receives HTTP 403. This database lookup means authorization uses the current stored role, rather than a potentially stale role claim in a token.

`GET /api/user/profile` is authenticated but returns the identity from the JWT (`userId`) directly; it does not query the user table.

## Project Structure

```text
role-api1/
├── .agents/skills/             # Project-local Prisma reference material
├── generated/prisma/           # Prisma-generated client and model types
├── prisma/
│   ├── migrations/
│   │   ├── 20260816083021_init/
│   │   │   └── migration.sql   # Role enum, User table, unique email index
│   │   └── migration_lock.toml
│   ├── schema.prisma           # PostgreSQL provider, Role enum, User model
│   └── seed.ts                 # Creates or promotes the configured admin user
├── src/
│   ├── config/swagger.ts       # OpenAPI metadata and Swagger configuration
│   ├── controllers/
│   │   └── auth.controller.ts  # Registration, login, current-user logic
│   ├── db/prisma.ts            # Prisma PostgreSQL client
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT bearer authentication
│   │   └── role.middleware.ts  # Database-backed admin check
│   ├── routes/
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── schemas/auth.schema.ts  # Zod request validation
│   ├── utils/jwt.ts            # JWT signing helper
│   └── server.ts               # Express setup and listener
├── .gitignore
├── skills-lock.json
├── package.json
├── package-lock.json
├── prisma.config.ts
├── readme.md
└── tsconfig.json
```

## Requirements

Use a Node.js version supported by both Prisma and swagger-jsdoc: `20.19.x`, `22.12.x` or later in the 22.x line, or `24.x` and newer. The repository does not declare an `engines` field in `package.json`.

A PostgreSQL database and its connection string are required. The `.env` file is ignored by Git; do not commit database credentials or JWT secrets.

## Environment Variables

| Variable | Required when | Purpose |
|---|---|---|
| `DATABASE_URL` | Running the API, Prisma commands, or seed | PostgreSQL connection string. |
| `JWT_SECRET` | Starting the API | Secret used by `jsonwebtoken` to sign and verify tokens. The JWT utility and authentication middleware throw if it is missing. |
| `PORT` | Optional | HTTP port; the server defaults to `5000` when this is unset. |
| `ADMIN_EMAIL` | Running the seed | Email address used to find or create the seeded admin account. |
| `ADMIN_PASSWORD` | Running the seed | Password to hash for a newly created seeded admin account. On an existing account, the seed updates the role to `ADMIN` but does not replace its password. |

For local use, create a `.env` file in the repository root and set the variables needed for the commands you run. The application loads environment variables through `dotenv`; `src/db/prisma.ts` also imports `dotenv/config` before reading the database URL.

## API Reference

The interactive reference is served at [`/api-docs`](https://role-api-zlpr.onrender.com/api-docs) in production and at `http://localhost:5000/api-docs` locally. In Swagger UI, use **Authorize** and paste the token value returned by login; Swagger's bearer scheme supplies the `Bearer` prefix.

All JSON request bodies use `Content-Type: application/json`.

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create a `USER` account. |
| `POST` | `/api/auth/login` | No | Verify credentials and return a JWT. |
| `GET` | `/api/auth/me` | Bearer JWT | Fetch the authenticated user's public account fields from PostgreSQL. |
| `GET` | `/api/user/profile` | Bearer JWT | Return the `userId` identity from the verified token. |
| `GET` | `/api/admin/dashboard` | Bearer JWT + `ADMIN` role | Return the admin dashboard response. |
| `GET` | `/api/health` | No | Return the API health message. |
| `GET` | `/api/db-test` | No | Run `SELECT 1` through Prisma to check database connectivity. |

### Register

`POST /api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

The name must contain at least 2 characters, the email must be valid, and the password must contain at least 6 characters.

- `201 Created`: `{ "success": true, "message": "User registered successfully", "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER" } }`
- `400 Bad Request`: invalid input; the response message is the first Zod issue.
- `409 Conflict`: email already exists.
- `500 Internal Server Error`: other controller/database error, returned as `Something went wrong`.

### Login

`POST /api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

- `200 OK`: returns `success`, `message`, `token`, and a public `user` object containing `id`, `name`, `email`, and `role`.
- `400 Bad Request`: invalid email or missing/empty password.
- `401 Unauthorized`: the email or password is incorrect. Both cases use the same message.
- `500 Internal Server Error`: unexpected controller/database error.

### Current user

`GET /api/auth/me`

Send `Authorization: Bearer <token>`. On success, returns `{ "success": true, "user": { "id", "name", "email", "role", "createdAt", "updatedAt" } }`. The password hash is not returned.

- `200 OK`: user found.
- `401 Unauthorized`: token is missing/invalid/expired, or the token's user no longer exists.
- `500 Internal Server Error`: unexpected database/controller error.

### User profile

`GET /api/user/profile`

Requires a bearer token. Returns the verified JWT payload in `user` (including `userId`, `iat`, and `exp`). The handler does not fetch the user from PostgreSQL. The exact timestamp values depend on when the token was issued.

- `200 OK`: token accepted.
- `401 Unauthorized`: token is missing, malformed, invalid, or expired.

### Admin dashboard

`GET /api/admin/dashboard`

Requires a bearer token and a current `ADMIN` role in the database. On success, returns `success`, `message`, and `admin` with the verified JWT payload (`userId`, `iat`, and `exp`).

- `200 OK`: authenticated admin.
- `401 Unauthorized`: token is missing/invalid/expired or the user no longer exists.
- `403 Forbidden`: authenticated user is not an admin.
- `500 Internal Server Error`: role lookup failed.

### Health and database check

- `GET /api/health` returns HTTP 200 with `{ "success": true, "message": "Auth API is running" }`.
- `GET /api/db-test` returns HTTP 200 with `{ "success": true, "message": "Database connection successful" }` when the query succeeds, or HTTP 500 with `{ "success": false, "message": "Database connection failed" }` when it fails.

## Database and Migrations

The Prisma schema defines a PostgreSQL `User` table with an auto-incrementing integer ID, name, unique email, password hash, role, and timestamps. The `Role` enum has `USER` and `ADMIN`; new records default to `USER`. The checked-in initial migration creates that enum and table and adds a unique index on email.

Prisma's generator writes the client to `generated/prisma/`. `src/db/prisma.ts` constructs Prisma Client with `PrismaPg` and `DATABASE_URL`.

With dependencies installed and `DATABASE_URL` configured:

```bash
npx prisma generate
npx prisma migrate deploy
```

`migrate deploy` applies pending checked-in migrations; it does not create a new migration file. Migration authoring is not exposed as an npm script in this repository.

### Seed an administrator

`prisma/seed.ts` uses `ADMIN_EMAIL` and `ADMIN_PASSWORD`. It hashes the provided password with bcryptjs using 12 rounds, then upserts by email. For an existing account it changes the role to `ADMIN`; for a new account it creates `System Administrator` with the `ADMIN` role. It does not automatically run as part of the npm scripts.

Run it explicitly with:

```bash
npx tsx prisma/seed.ts
```

## Local Development

1. Install a supported Node.js version and npm.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` in the repository root with `DATABASE_URL` and `JWT_SECRET`. Set `PORT` only if you do not want the default `5000`.
4. Generate the Prisma client and apply the existing database migration:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

The server listens on `http://localhost:5000` by default. The local API docs are at `http://localhost:5000/api-docs`.

## Build and Production Start

Compile the TypeScript sources with:

```bash
npm run build
```

This runs `tsc` and emits the server under `dist/src/server.js` (with the generated Prisma client under `dist/generated/prisma/`). Start the compiled server with:

```bash
npm start
```

`npm start` runs `node dist/src/server.js`. The runtime environment must provide `DATABASE_URL` and `JWT_SECRET`; `PORT` is optional. Ensure the production database has all checked-in migrations applied before serving traffic.

No deployment manifest or hosting workflow is checked into this repository, so provider-specific build, migration, and environment configuration are not defined here. The production API and Swagger server URLs configured in the repository are:

- API: `https://role-api-zlpr.onrender.com`
- Swagger UI: `https://role-api-zlpr.onrender.com/api-docs`

## npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `nodemon --exec tsx src/server.ts` | Run and restart the TypeScript server during development. |
| `npm run build` | `tsc` | Compile TypeScript into `dist/`. |
| `npm start` | `node dist/src/server.js` | Run the compiled server. |
