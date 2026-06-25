# Database Schema

Kanban Studio uses a local SQLite database managed by Prisma ORM.

## Connection

- Provider: SQLite
- Connection URL: `file:./prisma/dev.db`
- ORM: Prisma

## Entity Relationship Diagram

```
+------+       +-------+       +--------+       +------+
| User |<----->| Board |<----->| Column |<----->| Card |
+------+       +-------+       +--------+       +------+
```

- A `User` owns exactly one `Board`.
- A `Board` contains many ordered `Column`s.
- A `Column` contains many ordered `Card`s.

## Models

### User

| Field        | Type   | Attributes             |
| ------------ | ------ | ---------------------- |
| id           | String | `@id @default(cuid())` |
| username     | String | `@unique`              |
| passwordHash | String |                        |
| board        | Board? | One-to-one relation    |

### Board

| Field   | Type     | Attributes                       |
| ------- | -------- | -------------------------------- |
| id      | String   | `@id @default(cuid())`           |
| userId  | String   | `@unique`                        |
| user    | User     | Relation to `User`               |
| columns | Column[] | One-to-many relation to `Column` |

### Column

| Field    | Type   | Attributes                          |
| -------- | ------ | ----------------------------------- |
| id       | String | `@id @default(cuid())`              |
| boardId  | String | Foreign key to `Board`              |
| title    | String | Display title                       |
| position | Int    | Index for ordering within the board |
| board    | Board  | Relation to `Board`                 |
| cards    | Card[] | One-to-many relation to `Card`      |

### Card

| Field    | Type   | Attributes                           |
| -------- | ------ | ------------------------------------ |
| id       | String | `@id @default(cuid())`               |
| columnId | String | Foreign key to `Column`              |
| title    | String | Card title                           |
| details  | String | Card description / details           |
| position | Int    | Index for ordering within the column |
| column   | Column | Relation to `Column`                 |

## Indexes

- `Column`: composite index on `(boardId, position)` for efficient column ordering.
- `Card`: composite index on `(columnId, position)` for efficient card ordering.

## Migrations

- Initial migration: `backend/prisma/migrations/20260625182613_init/migration.sql`
