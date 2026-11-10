import { describe, expect, it } from "vitest";
import sample from "../data/bookleaf_sample_data.json";

describe("assignment demo seed invariants", () => {
  it("contains exactly 10 authors and 18 books", () => {
    expect(sample.authors).toHaveLength(10);
    expect(sample.books).toHaveLength(18);
  });

  it("keeps IDs unique and all books linked to known authors", () => {
    const authors = new Set(sample.authors.map((author) => author.authorId));
    expect(authors.size).toBe(10);
    expect(new Set(sample.books.map((book) => book.bookId)).size).toBe(18);
    expect(sample.books.every((book) => authors.has(book.authorId))).toBe(true);
  });

  it("preserves zero-financial production books and consistent published balances", () => {
    const production = sample.books.filter((book) => book.publicationStatus === "In Production");
    expect(production.length).toBeGreaterThan(0);
    expect(production.every((book) => book.publicationDate === null && book.totalRoyaltyEarned === 0 && book.royaltyPaid === 0 && book.royaltyPending === 0)).toBe(true);
    expect(sample.books.filter((book) => book.publicationStatus === "Published").every((book) => book.totalRoyaltyEarned === book.royaltyPaid + book.royaltyPending)).toBe(true);
  });
});
