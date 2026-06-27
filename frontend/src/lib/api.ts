import type { BoardData, Card, Column } from "@/lib/kanban";

type BackendCard = {
  id: string;
  title: string;
  details: string;
  position: number;
};

type BackendColumn = {
  id: string;
  title: string;
  position: number;
  cards: BackendCard[];
};

type BackendBoard = {
  id: string;
  userId: string;
  columns: BackendColumn[];
};

export const transformBoard = (board: BackendBoard): BoardData => {
  const cards: Record<string, Card> = {};
  const columns: Column[] = [...board.columns]
    .sort((a, b) => a.position - b.position)
    .map((col) => {
      const cardIds = [...col.cards]
        .sort((a, b) => a.position - b.position)
        .map((card) => {
          cards[card.id] = {
            id: card.id,
            title: card.title,
            details: card.details,
          };
          return card.id;
        });
      return { id: col.id, title: col.title, cardIds };
    });
  return { columns, cards };
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // response had no JSON body; keep default message
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
};

export const fetchBoard = async (): Promise<BoardData> => {
  const board = await request<BackendBoard>("/api/board");
  return transformBoard(board);
};

export const renameColumn = (
  columnId: string,
  title: string,
): Promise<Column> =>
  request<Column>(`/api/columns/${columnId}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });

export const createCard = (
  columnId: string,
  title: string,
  details: string,
): Promise<Card> =>
  request<Card>("/api/cards", {
    method: "POST",
    body: JSON.stringify({ columnId, title, details }),
  });

export const deleteCard = (
  cardId: string,
): Promise<{ success: boolean }> =>
  request<{ success: boolean }>(`/api/cards/${cardId}`, {
    method: "DELETE",
  });

export const moveCard = (
  cardId: string,
  sourceColumnId: string,
  targetColumnId: string,
  sourceIndex: number,
  targetIndex: number,
): Promise<BoardData> =>
  request<BackendBoard>("/api/board/move", {
    method: "PUT",
    body: JSON.stringify({
      cardId,
      sourceColumnId,
      targetColumnId,
      sourceIndex,
      targetIndex,
    }),
  }).then(transformBoard);
