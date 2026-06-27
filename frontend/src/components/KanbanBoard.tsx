"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCardPreview } from "@/components/KanbanCardPreview";
import { createId, moveCard, type BoardData } from "@/lib/kanban";
import {
  fetchBoard,
  renameColumn as renameColumnApi,
  createCard as createCardApi,
  deleteCard as deleteCardApi,
  moveCard as moveCardApi,
} from "@/lib/api";

type KanbanBoardProps = {
  onLogout?: () => void;
};

const LOAD_ERROR_MESSAGE =
  "Failed to load the board. Check your connection and try again.";

export const KanbanBoard = ({ onLogout }: KanbanBoardProps) => {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const originalTitleRef = useRef<Record<string, string>>({});

  const loadBoard = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchBoard();
      setBoard(data);
    } catch {
      setLoadError(LOAD_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) onLogout?.();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const cardsById = useMemo(() => board?.cards ?? {}, [board]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over || active.id === over.id) {
      return;
    }

    setBoard((prev) => {
      if (!prev) return prev;

      const activeId = active.id as string;
      const overId = over.id as string;

      const sourceColumn = prev.columns.find((c) =>
        c.cardIds.includes(activeId)
      );
      if (!sourceColumn) return prev;
      const sourceColumnId = sourceColumn.id;
      const sourceIndex = sourceColumn.cardIds.indexOf(activeId);

      const isOverColumn = prev.columns.some((c) => c.id === overId);
      const targetColumnId = isOverColumn
        ? overId
        : prev.columns.find((c) => c.cardIds.includes(overId))?.id;
      if (!targetColumnId) return prev;
      const targetColumn = prev.columns.find((c) => c.id === targetColumnId);
      if (!targetColumn) return prev;
      const targetIndex = isOverColumn
        ? targetColumn.cardIds.length
        : targetColumn.cardIds.indexOf(overId);

      const snapshot = prev;
      void moveCardApi(
        activeId,
        sourceColumnId,
        targetColumnId,
        sourceIndex,
        targetIndex
      )
        .then((serverBoard) => setBoard(serverBoard))
        .catch(() => {
          setBoard(snapshot);
          setActionError("Failed to move card. Reverted to previous position.");
        });

      return { ...prev, columns: moveCard(prev.columns, activeId, overId) };
    });
  };

  const handleRenameColumn = (columnId: string, title: string) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((column) =>
              column.id === columnId ? { ...column, title } : column
            ),
          }
        : prev
    );
  };

  const handleRenameColumnFocus = (columnId: string) => {
    const column = board?.columns.find((c) => c.id === columnId);
    if (column) originalTitleRef.current[columnId] = column.title;
  };

  const handleRenameColumnCommit = (columnId: string, title: string) => {
    const trimmed = title.trim();
    const original = originalTitleRef.current[columnId] ?? title;

    if (!trimmed) {
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId ? { ...column, title: original } : column
              ),
            }
          : prev
      );
      return;
    }

    if (trimmed === original) return;

    void renameColumnApi(columnId, trimmed).catch(() => {
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId
                  ? { ...column, title: original }
                  : column
              ),
            }
          : prev
      );
      setActionError("Failed to rename column. Reverted.");
    });
  };

  const handleAddCard = (columnId: string, title: string, details: string) => {
    const tempId = createId("card");
    const resolvedDetails = details || "No details yet.";

    setBoard((prev) => {
      if (!prev) return prev;
      const snapshot = prev;

      void createCardApi(columnId, title, details)
        .then((card) => {
          setBoard((prev2) => {
            if (!prev2) return prev2;
            const nextCards = { ...prev2.cards };
            delete nextCards[tempId];
            return {
              columns: prev2.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      cardIds: column.cardIds.map((id) =>
                        id === tempId ? card.id : id
                      ),
                    }
                  : column
              ),
              cards: {
                ...nextCards,
                [card.id]: {
                  id: card.id,
                  title: card.title,
                  details: card.details || "No details yet.",
                },
              },
            };
          });
        })
        .catch(() => {
          setBoard(snapshot);
          setActionError("Failed to create card.");
        });

      return {
        ...prev,
        cards: {
          ...prev.cards,
          [tempId]: { id: tempId, title, details: resolvedDetails },
        },
        columns: prev.columns.map((column) =>
          column.id === columnId
            ? { ...column, cardIds: [...column.cardIds, tempId] }
            : column
        ),
      };
    });
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    setBoard((prev) => {
      if (!prev) return prev;
      const snapshot = prev;

      void deleteCardApi(cardId).catch(() => {
        setBoard(snapshot);
        setActionError("Failed to delete card.");
      });

      return {
        ...prev,
        cards: Object.fromEntries(
          Object.entries(prev.cards).filter(([id]) => id !== cardId)
        ),
        columns: prev.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                cardIds: column.cardIds.filter((id) => id !== cardId),
              }
            : column
        ),
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-blue)] border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
        <div className="max-w-md rounded-3xl border border-[var(--stroke)] bg-white p-8 text-center shadow-[var(--shadow)]">
          <h1 className="font-display text-2xl font-semibold text-[var(--navy-dark)]">
            Board unavailable
          </h1>
          <p className="mt-3 text-sm text-[var(--gray-text)]">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadBoard()}
            className="mt-6 rounded-full bg-[var(--secondary-purple)] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:brightness-110"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!board) return null;

  const activeCard = activeCardId ? cardsById[activeCardId] : null;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col gap-10 px-6 pb-16 pt-12">
        {actionError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-medium text-red-600"
          >
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="rounded-full px-2 py-1 font-semibold uppercase tracking-wider transition hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <header className="flex flex-col gap-6 rounded-[32px] border border-[var(--stroke)] bg-white/80 p-8 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
                Single Board Kanban
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy-dark)]">
                Kanban Studio
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--gray-text)]">
                Keep momentum visible. Rename columns, drag cards between stages,
                and capture quick notes without getting buried in settings.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
                  Focus
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--primary-blue)]">
                  One board. Five columns. Zero clutter.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--gray-text)] transition hover:border-[var(--navy-dark)] hover:text-[var(--navy-dark)] cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
                {column.title}
              </div>
            ))}
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <section className="grid gap-6 lg:grid-cols-5">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={column.cardIds
                  .map((cardId) => board.cards[cardId])
                  .filter(Boolean)}
                onRename={handleRenameColumn}
                onRenameFocus={handleRenameColumnFocus}
                onRenameCommit={handleRenameColumnCommit}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </section>
          <DragOverlay>
            {activeCard ? (
              <div className="w-[260px]">
                <KanbanCardPreview card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};
