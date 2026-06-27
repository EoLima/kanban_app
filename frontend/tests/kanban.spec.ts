import { expect, test } from "@playwright/test";

const loginIfRequired = async (page: import("@playwright/test").Page) => {
  const usernameInput = page.getByPlaceholder("Enter your username");
  const needsLogin = await usernameInput
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  if (!needsLogin) return;
  await usernameInput.fill("user");
  await page.getByPlaceholder("Enter your password").fill("password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(
    page.getByRole("heading", { name: "Kanban Studio" })
  ).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await loginIfRequired(page);
});

test("loads the kanban board with five columns", async ({ page }) => {
  await expect(page.locator('[data-testid^="column-"]')).toHaveCount(5);
});

test("creates a card that persists on reload", async ({ page }) => {
  const firstColumn = page.locator('[data-testid^="column-"]').first();
  await firstColumn.getByRole("button", { name: /add a card/i }).click();

  const cardTitle = `Persist card ${Date.now()}`;
  await firstColumn.getByPlaceholder("Card title").fill(cardTitle);
  await firstColumn.getByPlaceholder("Details").fill("E2E persistence check.");
  await firstColumn.getByRole("button", { name: /^add card$/i }).click();

  await expect(firstColumn.getByText(cardTitle)).toBeVisible();

  await page.reload();
  await expect(firstColumn.getByText(cardTitle)).toBeVisible();
});

test("moves a card between columns and persists on reload", async ({ page }) => {
  const firstColumn = page.locator('[data-testid^="column-"]').first();
  const lastColumn = page.locator('[data-testid^="column-"]').last();

  await firstColumn.getByRole("button", { name: /add a card/i }).click();
  const cardTitle = `Drag card ${Date.now()}`;
  await firstColumn.getByPlaceholder("Card title").fill(cardTitle);
  await firstColumn.getByPlaceholder("Details").fill("Drag me.");
  await firstColumn.getByRole("button", { name: /^add card$/i }).click();
  await expect(firstColumn.getByText(cardTitle)).toBeVisible();

  const card = page
    .locator("article")
    .filter({ hasText: cardTitle })
    .first();
  const targetColumn = lastColumn;

  const cardBox = await card.boundingBox();
  const columnBox = await targetColumn.boundingBox();
  if (!cardBox || !columnBox) {
    throw new Error("Unable to resolve drag coordinates.");
  }

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    columnBox.x + columnBox.width / 2,
    columnBox.y + 120,
    { steps: 12 }
  );
  await page.mouse.up();

  await expect(targetColumn.getByText(cardTitle)).toBeVisible();

  await page.reload();

  await expect(targetColumn.getByText(cardTitle)).toBeVisible();
  await expect(firstColumn.getByText(cardTitle)).toHaveCount(0);
});
