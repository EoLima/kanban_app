import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { KanbanBoard } from "@/components/KanbanBoard";

const mockBoardResponse = {
  id: "board-1",
  userId: "user-1",
  columns: [
    { id: "col-1", title: "Backlog", position: 0, cards: [] },
    { id: "col-2", title: "Discovery", position: 1, cards: [] },
    { id: "col-3", title: "In Progress", position: 2, cards: [] },
    { id: "col-4", title: "Review", position: 3, cards: [] },
    { id: "col-5", title: "Done", position: 4, cards: [] },
  ],
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";

    if (url === "/api/board" && method === "GET") {
      return { ok: true, status: 200, json: async () => mockBoardResponse };
    }
    if (url === "/api/board/move" && method === "PUT") {
      return { ok: true, status: 200, json: async () => mockBoardResponse };
    }
    if (url === "/api/cards" && method === "POST") {
      const body = JSON.parse(init!.body as string);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: "card-new",
          columnId: body.columnId,
          title: body.title,
          details: body.details,
          position: 0,
        }),
      };
    }
    if (url.startsWith("/api/cards/") && method === "DELETE") {
      return { ok: true, status: 200, json: async () => ({ success: true }) };
    }
    if (url.startsWith("/api/columns/") && method === "PUT") {
      return { ok: true, status: 200, json: async () => ({ id: "col-1", title: "x", position: 0 }) };
    }

    return { ok: false, status: 404, json: async () => ({ message: "not found" }) };
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("KanbanBoard", () => {
  it("loads and renders five columns from the API", async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/board", expect.any(Object));
  });

  it("renames a column locally and commits on blur", async () => {
    render(<KanbanBoard />);
    const column = await screen.findByTestId("column-col-1");
    const input = within(column).getByLabelText("Column title") as HTMLInputElement;

    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");

    await userEvent.tab();
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.find(
          ([url, init]) =>
            typeof url === "string" &&
            url.startsWith("/api/columns/col-1") &&
            (init as RequestInit | undefined)?.method === "PUT"
        )
      ).toBeTruthy();
    });
  });

  it("adds and removes a card via the API", async () => {
    render(<KanbanBoard />);
    const column = await screen.findByTestId("column-col-1");
    const addButton = within(column).getByRole("button", { name: /add a card/i });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(
      within(column).getByRole("button", { name: /^add card$/i })
    );

    await waitFor(() => {
      expect(within(column).getByText("New card")).toBeInTheDocument();
    });

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(within(column).queryByText("New card")).not.toBeInTheDocument();
    });
    expect(
      fetchMock.mock.calls.find(
        ([url, init]) =>
          typeof url === "string" &&
          url.startsWith("/api/cards/") &&
          (init as RequestInit | undefined)?.method === "DELETE"
      )
    ).toBeTruthy();
  });
});
