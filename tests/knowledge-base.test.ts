import { describe, expect, it } from "vitest";
import { getKnowledgeForCategory } from "@/knowledge-base/bookleaf";

describe("knowledge-base routing", () => {
  it("selects the royalty policy without sending unrelated policy sections", () => {
    const context = getKnowledgeForCategory("Royalty & Payments");
    expect(context).toContain("80% of net profit");
    expect(context).toContain("45 days");
    expect(context).not.toContain("free reprint");
  });

  it("selects printing verification policy", () => {
    expect(getKnowledgeForCategory("Printing & Quality")).toContain("photographs");
  });
});
