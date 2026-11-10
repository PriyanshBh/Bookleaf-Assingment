import { describe, expect, it } from "vitest";
import { aiDraftSchema, createTicketSchema, ticketClassificationSchema } from "@/lib/validation";

describe("ticket validation", () => {
  it("accepts a detailed support request", () => {
    expect(createTicketSchema.parse({ bookId: null, subject: "Royalty payout missing", description: "My quarterly payout has not reached the linked account." })).toMatchObject({ subject: "Royalty payout missing" });
  });

  it("rejects incomplete submissions", () => {
    expect(createTicketSchema.safeParse({ subject: "Help", description: "Too short" }).success).toBe(false);
  });
});

describe("AI structured output", () => {
  it("accepts only exact BookLeaf categories and priorities", () => {
    expect(ticketClassificationSchema.parse({ category: "Printing & Quality", priority: "High", reason: "Multiple defective copies require documented quality review." }).priority).toBe("High");
  });

  it("rejects malformed or invented enums", () => {
    expect(ticketClassificationSchema.safeParse({ category: "Billing", priority: "Urgent", reason: "Invalid enums should never be persisted." }).success).toBe(false);
  });

  it("requires a substantive editable draft", () => {
    expect(aiDraftSchema.safeParse({ draft: "Okay" }).success).toBe(false);
  });
});
