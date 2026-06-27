# Master Plan - Kanban Studio Project Management MVP

This document contains the step-by-step implementation checklist, validation plans, and success criteria for all remaining parts of the Kanban Studio MVP.

---

## Part 2: Backend Scaffolding & Containerization

### Tasks Checklist

- [ X ] Initialize NestJS backend in a new directory named `backend/`.
- [ X ] Install necessary dependencies for NestJS (express, static-serve config).
- [ X ] Set up static serving in NestJS using `@nestjs/serve-static` to serve static assets from the frontend static export folder.
- [ X ] Create a placeholder endpoint `GET /api/hello` returning a dummy JSON object `{"message": "Hello from Backend"}`.
- [ X ] Write a Dockerfile at the project root supporting building the Next.js frontend, copying assets into NestJS static path, and building/exposing the NestJS server.
- [ X ] Create shell and batch start/stop scripts in a `scripts/` directory:
  - For Windows: `scripts/start.bat`, `scripts/stop.bat`
  - For Mac/Linux: `scripts/start.sh`, `scripts/stop.sh`
  - The start scripts will build and run the docker container locally at port 3000.
  - The stop scripts will stop and clean up the docker container.

### Success Criteria

- Running the start script builds the Docker container and starts the server.
- Requesting `http://localhost:3000/api/hello` returns the correct JSON payload.
- Requesting `http://localhost:3000/` serves a basic mock HTML page before frontend integration.
- Running the stop script terminates the container and removes associated image resources.

### Test & Verification Plan

- **Manual Verification**: Run script and access `curl http://localhost:3000/api/hello` and `curl http://localhost:3000/`.

---

## Part 3: Frontend Build Integration

### Tasks Checklist

- [ X ] Update `frontend/next.config.ts` to output a static export (`output: 'export'`).
- [ X ] Adjust Dockerfile to build the Next.js static assets and copy them into NestJS's serving folder.
- [ X ] Update NestJS configuration to serve the dynamic Next.js bundle at `/`.
- [ X ] Create frontend build validation scripts to run in the container pipeline.

### Success Criteria

- Next.js build succeeds, compiling all pages and assets statically.
- Navigating to `http://localhost:3000/` displays the premium Kanban Board layout correctly.
- Interacting with client-side drag-and-drop works flawlessly using the static files.
- Running the test suites (`npm run test:unit` and `npm run test:e2e` in `frontend`) passes inside and outside of the container.

### Test & Verification Plan

- **Automated Tests**: Run Vitest and Playwright test commands inside the container directory structure.

---

## Part 4: Session Authentication

### Tasks Checklist

- [ X ] Design and build a beautiful, premium login interface matching the core navy/purple/yellow color scheme.
- [ X ] Add route guarding or local conditional view injection in Next.js:
  - If a user session is absent, display the Login panel.
  - If a user session is present, show the Kanban Board.
- [ X ] Create backend endpoint `POST /api/auth/login` validating credentials against `"user"` and `"password"`. On success, set a session cookie or token.
- [ X ] Create backend endpoint `POST /api/auth/logout` to clear session tokens/cookies.
- [ X ] Add a Sign Out option on the Kanban Board dashboard header.

### Success Criteria

- Direct access to `/` redirects or prompts with the Login interface when unauthenticated.
- Submitting `"user"` and `"password"` successfully logs the user in and displays the board.
- Invalid input displays a clean validation error.
- Clicking Log Out immediately invalidizes the session and brings back the Login screen.

### Test & Verification Plan

- **E2E Integration Test**: Write a Playwright spec verifying the login, incorrect credentials error rendering, and logout flow.

---

## Part 5: Database Modeling & Schema

### Tasks Checklist

- [ X ] Initialize Prisma ORM in the `backend/` project configuring it to use a local SQLite database (`dev.db`).
- [ X ] Define the Prisma model schema representing the following entities:
  - `User`: unique ID, username, passwordHash (pre-seeded with hashed 'password')
  - `Board`: unique ID, userId, relation to User (each user has 1 board)
  - `Column`: ID, boardId, title, position/index, relation to Board
  - `Card`: ID, columnId, title, details, position/index, relation to Column
- [ X ] Save schema configuration and export schema summary to `docs/DB_SCHEMA.md`.

### Success Criteria

- Prisma migration executes cleanly, generating the SQLite local database file.
- Client bindings compile and are fully functional inside the NestJS services.

### Test & Verification Plan

- **Manual Verification**: Run Prisma Studio to verify SQLite tables are successfully generated with the correct fields.

---

## Part 6: Backend API Implementation

### Tasks Checklist

- [ X ] Set up automated database verification in the backend application startup lifecycle:
  - If database file does not exist, run schema migration dynamically.
  - Auto-seed the database with the default `"user"` and initial set of columns (Backlog, Discovery, In Progress, Review, Done) and cards.
- [ X ] Implement NestJS controllers and services with CRUD endpoints for:
  - `GET /api/board` - retrieve the board metadata, columns, and cards.
  - `PUT /api/columns/:id` - update a column's title.
  - `POST /api/cards` - create a card in a specific column.
  - `PUT /api/cards/:id` - update a card's title, description, or column position.
  - `DELETE /api/cards/:id` - delete a card.
  - `PUT /api/board/move` - update drag-and-drop card movements (ordering updates).
- [ X ] Apply session verification guards to all `/api/board` and `/api/cards` endpoints.
- [ X ] Write integration test suites for NestJS controllers using mock request context.

### Success Criteria

- API requests successfully query and mutate columns/cards in the SQLite database.
- Moving or modifying items dynamically persists changes.
- Unauthenticated API calls return `401 Unauthorized`.

### Test & Verification Plan

- **Automated Tests**: Implement controller integration tests in NestJS using Supertest.

---

## Part 7: Frontend + Backend Integration

### Tasks Checklist

- [ X ] Replace mock frontend board state loading with an API request to `GET /api/board` upon initial load.
- [ X ] Update frontend column renaming inputs, card creation, and card deletion to fire API requests.
- [ X ] Integrate `@dnd-kit` event handlers to fire `PUT /api/board/move` calls when dragging card items.
- [ X ] Add smooth optimistic state rendering during card movements and details updating.
- [ X ] Implement subtle loading overlays and error boundaries.

### Success Criteria

- Loading the website retrieves the board state directly from the SQLite database.
- Dragging cards, editing columns, or modifying cards maintains their state permanently on reload.
- Client actions fail gracefully with feedback messages if the network is disconnected.

### Test & Verification Plan

- **E2E Tests**: Update Playwright scripts to assert that card drag-and-drop states remain consistent on page reload.

---

## Part 8: AI OpenRouter Connection

### Tasks Checklist

- [ X ] Implement an AI integration service in the NestJS backend.
- [ X ] Parse `OPENROUTER_API_KEY` from environment.
- [ X ] Implement connectivity validation route `POST /api/ai/test`. This sends a simple mathematical request (e.g. `2+2=`) to OpenRouter targeting the `openai/gpt-oss-20b:free` model.
- [ X ] Set proper referer headers (`HTTP-Referer` and `X-Title`) to register the request correctly.

### Success Criteria

- Sending request to `/api/ai/test` connects successfully to OpenRouter and outputs the result `4`.
- API timeouts and errors are handled and logged correctly.

### Test & Verification Plan

- **Manual Verification**: Run integration testing endpoint manually or via postman to verify prompt resolution.

---

## Part 9: AI Prompting & Structured Outputs

### Tasks Checklist

- [ X ] Define system prompts for `openai/gpt-oss-20b:free` passing:
  - Current board structure JSON (all columns, cards, and keys).
  - User's text prompt request.
  - Structured output JSON schema.
- [ X ] Enforce the model to return a structured JSON response matching:

  ```json
  {
    "type": "object",
    "properties": {
      "reply": { "type": "string" },
      "updates": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "action": {
              "type": "string",
              "enum": ["CREATE", "EDIT", "MOVE", "DELETE"]
            },
            "cardId": { "type": "string" },
            "title": { "type": "string" },
            "details": { "type": "string" },
            "columnId": { "type": "string" }
          },
          "required": ["action"]
        }
      }
    },
    "required": ["reply", "updates"]
  }
  ```

- [ X ] Implement route `POST /api/ai/chat` passing user message context, message history, and board payload.
- [ X ] Parse the returned structured JSON. Apply the updates (card creations, movements, deletions, details edits) directly to the database.
- [ X ] Create mock integration tests for the AI parser.

### Success Criteria

- Prompting "create a card in Backlog to write tests" triggers `CREATE` update and adds card.
- Prompting "Move card-X to Done" triggers `MOVE` update and migrates card database records.
- Replies back from LLM are structured, friendly, and correct.

### Test & Verification Plan

- **Automated Tests**: Write backend unit tests verifying database mutators update the SQLite DB correctly when fed various update array commands.

---

## Part 10: Beautiful Sidebar & Chat Interface

### Tasks Checklist

- [ ] Implement a sliding toggle chat sidebar on the Next.js Kanban board UI.
- [ ] Style the sidebar with high-quality visual polish (acrylic glassmorphism background, custom scrollbars, typing loaders, micro-animations, color-coded chat bubbles).
- [ ] Integrate chat panel inputs to dispatch messages to `/api/ai/chat`.
- [ ] On receiving response from backend chat:
  - Display the text reply.
  - If board modifications were executed, automatically re-fetch the board data or update the local React state immediately with no screen blink.
- [ ] Add conversation history memory so the user can have multi-turn conversations.

### Success Criteria

- User can open/close the chat sidebar gracefully.
- AI chat functions dynamically, modifying the board in real-time based on natural language requests.
- Visual micro-animations are responsive and feel premium.

### Test & Verification Plan

- **E2E Verification**: Write Playwright test simulating chat-directed board adjustments and verify UI changes occur dynamically.
