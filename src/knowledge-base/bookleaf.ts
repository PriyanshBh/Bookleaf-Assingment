import type { TicketCategory } from "@/lib/constants";

export const companyOverview = `BookLeaf operates in India and the United States. It offers Standard Free and Bestseller Breakthrough packages, covering design, typesetting, ISBN assignment, printing, distribution, and royalty management. Printing partners include the in-house Delhi facility, Repro India, and Epitome Books.`;

export const knowledgeSections: Record<TicketCategory, string> = {
  "Royalty & Payments": `Authors receive 80% of net profit and BookLeaf receives 20%. Net profit is MRP minus printing costs, platform commission, and shipping. Royalties are calculated quarterly and paid within 45 days after quarter end. The minimum payout is ₹1,000; smaller balances roll over. Payouts go to the linked bank account.`,
  "ISBN & Metadata Issues": `BookLeaf assigns a unique ISBN under its publisher imprint. Authors who need their own imprint obtain an ISBN independently. ISBN errors are high-priority production issues and should be escalated with the book and incorrect metadata identified.`,
  "Printing & Quality": `Standard printing turnaround is 5–7 business days. Verified manufacturing defects qualify for a free reprint. Support may request clear photographs of the defective copy and shipping label before approving a reprint.`,
  "Distribution & Availability": `Supported channels include Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store. New listings typically appear within 7–10 business days after publication completes. Stock synchronization can require 24–48 hours to resolve.`,
  "Book Status & Production Updates": `Production stages are Manuscript Received; Editing when selected; Cover Design; Typesetting; Proofreading; ISBN Assignment; Printing; Distribution Setup; Published & Live. Cover approval and proofreading revisions are common delay points.`,
  "General Inquiry": `BookLeaf supports cover design, typesetting, ISBN assignment, printing, distribution, and royalty management through its Standard Free and Bestseller Breakthrough packages. Give only information supported by the ticket record or these policies.`,
};

export function getKnowledgeForCategory(category: TicketCategory) {
  return `${companyOverview}\n\nRelevant policy:\n${knowledgeSections[category]}`;
}
