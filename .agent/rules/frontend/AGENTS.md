# Frontend Documentation for Kanban Studio

This document describes the architectural layout, dependencies, and styling variables of the frontend-only Kanban board MVP in `frontend`.

## Technology Stack & Dependencies

- **Framework**: Next.js v16.1.6 (App Router)
- **Runtime**: React v19.2.3 and React-DOM v19.2.3
- **Drag-and-Drop**: `@dnd-kit/core` and `@dnd-kit/sortable`
- **Styling**: TailwindCSS v4 with `@tailwindcss/postcss`
- **Testing**: Vitest for unit tests, Playwright for E2E tests

## CSS Design Tokens & Variable Themes

Custom visual tokens are defined in [globals.css](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/frontend/src/app/globals.css) and imported via `@import "tailwindcss"`:
- `--accent-yellow`: `#ecad0a` (design highlights)
- `--primary-blue`: `#209dd7` (headers / primary elements)
- `--secondary-purple`: `#753991` (action / submit buttons)
- `--navy-dark`: `#032147` (headings / text elements)
- `--gray-text`: `#888888` (secondary copy and metadata labels)
- `--surface`: `#f7f8fb` (app background)
- `--surface-strong`: `#ffffff` (card/column backgrounds)
- `--stroke`: `rgba(3, 33, 71, 0.08)` (borders and separators)
- `--shadow`: `0 18px 40px rgba(3, 33, 71, 0.12)` (elevation)

## Component Breakdown

1. **[KanbanBoard.tsx](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/frontend/src/components/KanbanBoard.tsx)**:
   - Root container and orchestrator.
   - Sets up sensors (`PointerSensor` requiring `distance: 6` to allow clicking text fields without triggering drag).
   - Manages state of type `BoardData` (columns list, cards registry map, and active dragging ID overlay).
   - Implements event handlers for dragging, card addition/removal, and column renaming.

2. **[KanbanColumn.tsx](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/frontend/src/components/KanbanColumn.tsx)**:
   - Wraps cards with `@dnd-kit`'s `SortableContext` using a vertical list sorting strategy.
   - Provides a droppable boundary via `useDroppable`.
   - Embeds the renaming text input for the column title.
   - Hosts `NewCardForm` at the bottom.

3. **[KanbanCard.tsx](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/frontend/src/components/KanbanCard.tsx)**:
   - Sortable element using `useSortable`.
   - Passes drag listeners and attributes to the outer article element.
   - Displays title and detail contents.
   - Houses the remove action button.

4. **[KanbanCardPreview.tsx](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/frontend/src/components/KanbanCardPreview.tsx)**:
   - Plain layout component used inside `<DragOverlay>` to render the dragging silhouette without sortable hooks or active delete controls.

5. **[NewCardForm.tsx](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/frontend/src/components/NewCardForm.tsx)**:
   - Handles the collapsed/expanded UI logic for inputting the title and description details of a card.

## State Management and Mutators

Helper structures are defined in [kanban.ts](file:///C:/Users/lucas/Documents/Dev/Cursos/Master%20Vibe%20Coding%20with%20AI%20Coding%20Agents/pm/frontend/src/lib/kanban.ts):
- **Types**: `Card`, `Column`, and `BoardData`.
- **`initialData`**: Prepopulated set of 5 columns (Backlog, Discovery, In Progress, Review, Done) with 8 cards total.
- **`moveCard()`**: Handles dragging calculations (reordering cards in the same column vs. migrating/inserting cards into a different column).
- **`createId()`**: Generates high-entropy random identifiers based on timestamp and base-36 strings.
