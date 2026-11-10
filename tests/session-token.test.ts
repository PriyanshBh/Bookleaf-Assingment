import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "@/lib/session-token";

const secret = "test-secret-with-at-least-thirty-two-characters";

describe("signed session tokens", () => {
  it("round-trips an authenticated role without exposing a password", async () => {
    const input = { userId: "507f1f77bcf86cd799439011", role: "AUTHOR" as const, name: "Priya Sharma", email: "priya@example.com" };
    const token = await signSessionToken(input, secret, 60);
    await expect(verifySessionToken(token, secret)).resolves.toEqual(input);
    expect(token).not.toContain(input.email);
  });

  it("rejects a token verified with another secret", async () => {
    const token = await signSessionToken({ userId: "1", role: "ADMIN", name: "Admin", email: "admin@example.com" }, secret, 60);
    await expect(verifySessionToken(token, `${secret}-wrong`)).resolves.toBeNull();
  });
});
