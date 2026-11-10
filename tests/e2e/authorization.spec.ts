import { expect, test } from "@playwright/test";

const demoPassword = "BookLeafDemo!2026";

test("author login exposes only the author workspace and owned books", async ({ request }) => {
  const login = await request.post("/api/auth/login", { data: { email: "priya.sharma@email.com", password: demoPassword } });
  expect(login.ok()).toBe(true);
  const books = await request.get("/api/books");
  expect(books.ok()).toBe(true);
  const payload = await books.json();
  expect(payload.data).toHaveLength(3);
  const admin = await request.get("/api/admin/dashboard");
  expect(admin.status()).toBe(403);
});

test("author cannot retrieve another author's ticket by object id", async ({ playwright }) => {
  const admin = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  const author = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  try {
    expect((await admin.post("/api/auth/login", { data: { email: "admin@bookleaf.demo", password: demoPassword } })).ok()).toBe(true);
    const queue = await admin.get("/api/admin/tickets?pageSize=50");
    const queuePayload = await queue.json();
    const otherAuthorTicket = queuePayload.data.rows.find((ticket: { author: { email: string } }) => ticket.author.email !== "priya.sharma@email.com");
    expect(otherAuthorTicket).toBeTruthy();

    expect((await author.post("/api/auth/login", { data: { email: "priya.sharma@email.com", password: demoPassword } })).ok()).toBe(true);
    const forbiddenTicket = await author.get(`/api/tickets/${otherAuthorTicket._id}`);
    expect(forbiddenTicket.status()).toBe(404);
  } finally {
    await admin.dispose();
    await author.dispose();
  }
});
