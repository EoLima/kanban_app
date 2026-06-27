# Kanban Studio

A project management MVP with a Kanban board and AI-powered chat assistant.

## Features

- Login with hardcoded credentials (`user` / `password`)
- Kanban board with 5 fixed columns (Backlog, Discovery, In Progress, Review, Done)
- Drag-and-drop cards between columns
- Create, edit, and delete cards
- AI chat sidebar for natural language card management
- Renamable column titles

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4, @dnd-kit
- **Backend**: NestJS 11, Prisma ORM, SQLite
- **AI**: OpenRouter (openai/gpt-oss-20b:free)
- **Container**: Docker

## Quick Start

```bash
cp .env.example .env   # add OPENROUTER_API_KEY
./scripts/start.sh      # builds and runs on port 3000
```

For Windows: `./scripts/start.bat`
Stop with: `./scripts/stop.bat`

For Linux/Mac: `./scripts/start.sh`
Stop with: `./scripts/stop.sh`

## Architecture

Single-page app served by NestJS backend inside a Docker container. Static Next.js export is served at `/`. API endpoints live under `/api/*`.

## Scripts

| Script                  | Purpose                                |
| ----------------------- | -------------------------------------- |
| `scripts/start.sh`      | Build Docker image and start container |
| `scripts/stop.sh`       | Stop and clean up container            |
| `scripts/start.bat`     | Windows start                          |
| `scripts/stop.bat`      | Windows stop                           |
| `scripts/e2e-server.sh` | E2E test server                        |

## Project Structure

```
backend/     - NestJS API + Prisma schema
frontend/    - Next.js UI
docs/        - Planning and schema docs
scripts/     - Start/stop scripts
Dockerfile   - Multi-stage Docker build
```

## Color Scheme

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991`
- Dark Navy: `#032147`
- Gray Text: `#888888`

## License

UNLICENSED
