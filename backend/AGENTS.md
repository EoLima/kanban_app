# NestJS Backend Documentation

This document describes the architectural layout, modules, endpoints, and build steps of the NestJS application located in `backend`.

## Architecture & Configuration

- **Framework**: NestJS (v11) utilizing TypeScript.
- **Entry point**: [main.ts](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/backend/src/main.ts) compiles and boots the Nest application on port 3000 (default, customizable via `PORT` env var).
- **Compilation Output**: TypeScript files are transpiled to JavaScript by the Nest compiler and outputted to the `backend/dist/` directory.

## Core Modules & Routing

1. **[AppModule](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/backend/src/app.module.ts)**:
   - Root application module.
   - Configured with `ServeStaticModule` from `@nestjs/serve-static` to serve compiled frontend static files from the `backend/public/` directory (mapped in the root directory relative to the compiled module location `join(__dirname, '..', 'public')`).
   - Excludes `/api*` paths to prevent static server overrides of the API controller.

2. **[AppController](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/backend/src/app.controller.ts)**:
   - Prefixed with `api/` route context.
   - Currently implements `GET /api/hello` to return JSON `{ "message": "Hello from Backend" }`.

3. **[AppService](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/backend/src/app.service.ts)**:
   - Standard placeholder service injection.

## Test Suite

- **Unit Testing**: Powered by Jest. Test configuration is mapped in `backend/package.json` under `jest`. Unit test specs reside alongside logic (e.g. `src/app.controller.spec.ts`).
- **E2E Testing**: Located in `backend/test/` directory, testing the application context from external request handlers.

## Scripts & Operations

Inside the `backend/` directory:
- `npm run dev` / `npm run start:dev`: Runs the development server with automatic file watchers.
- `npm run build`: Standard CLI build compiling TS to `dist/`.
- `npm run start:prod` / `node dist/main`: Starts the production build server.
- `npm run test`: Executes the Jest unit test suites.