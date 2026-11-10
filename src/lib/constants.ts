export const ROLES = ["AUTHOR", "ADMIN"] as const;
export const TICKET_CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
] as const;
export const TICKET_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
export const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"] as const;
export const PUBLICATION_STATUSES = ["Published", "In Production"] as const;
export const AI_PROCESSING_STATUSES = ["PENDING", "COMPLETED", "FAILED", "NOT_CONFIGURED"] as const;
export const SOURCE_TYPES = ["AI", "MANUAL", "FALLBACK"] as const;

export type Role = (typeof ROLES)[number];
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const PRIORITY_WEIGHT: Record<TicketPriority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const SESSION_COOKIE = "bookleaf_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
