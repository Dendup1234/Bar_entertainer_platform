# Repository Guidelines

## Project Structure & Module Organization

Node.js Express API using ES modules and Mongoose. `server.js` loads env vars, connects to MongoDB, and mounts routes.

- `routes/`: Express route definitions for `entertainer` and `organizer`/bar APIs.
- `controllers/`: Request handlers grouped by domain, for example `controllers/organizer/booking.js`.
- `models/`: Mongoose schemas such as `booking.js`, `event.js`, `bar.js`, and `entertainer.js`.
- `middleware/`: Shared request middleware, currently authentication.
- `config/`: MongoDB and Azure Blob Storage setup.
- `utils/`: JWT, email, cursor pagination, and update helpers.
- `docs/`: Swagger UI and the OpenAPI document.

No dedicated `tests/` directory exists yet.

## Build, Test, and Development Commands

- `npm install`: Install dependencies from `package-lock.json`.
- `npm run dev`: Start the API with `nodemon server.js` for local development.
- `npm start`: Start the API with `node server.js`.
- `npm test`: Placeholder command; add real tests before relying on CI.

Local runs require `.env` values such as `PORT`, `MONGO_URI`, `JWT_SECRET`, email settings, app URLs, and Azure storage variables.

## API Documentation

Swagger UI is available at `http://localhost:<PORT>/api-docs` after running the backend. With the README example port, use `http://localhost:5000/api-docs`. The raw spec is served from `/api-docs/openapi.json` and stored at `docs/openapi.json`.

When changing routes, request bodies, response shapes, or auth requirements, update `docs/openapi.json` in the same change.

## Coding Style & Naming Conventions

Use ES module syntax (`import`/`export`). Prefer `camelCase` for variables, functions, and exported controller methods, and use singular lowercase model filenames.

The code uses semicolons and mostly 2-space indentation, with some older tab-indented files. Match nearby style. Validate input early, return explicit status codes, and send JSON objects with a `message` field.

## Testing Guidelines

When adding tests, use Jest or Vitest with Supertest for HTTP endpoints. Place tests under `tests/` or beside modules as `*.test.js`. Cover auth, booking transitions, event applications, review tokens, and Azure upload edge cases. Mock email, MongoDB, and Azure Blob clients.

## Commit & Pull Request Guidelines

Recent commits use short summaries such as `Added more review apis` and `Fixed logic error on update booking status`. Keep commits scoped to one behavior change.

Pull requests should include a description, affected routes or models, environment changes, test results, and sample request/response payloads when API behavior changes.

## Security & Configuration Tips

Never commit `.env` files, connection strings, JWT secrets, email credentials, or Azure keys. Validate authenticated user IDs from `req.user.sub` before database writes, and avoid exposing raw internal errors in new public endpoints.
