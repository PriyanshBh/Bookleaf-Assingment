import { z } from "zod";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const createTicketSchema = z.object({
  bookId: z.string().trim().nullable().optional(),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(160),
  description: z.string().trim().min(20, "Please provide at least 20 characters").max(5_000),
});

export const messageSchema = z.object({
  content: z.string().trim().min(2, "Reply is too short").max(5_000),
});

export const noteSchema = z.object({
  content: z.string().trim().min(2, "Note is too short").max(3_000),
});

export const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  category: z.enum(TICKET_CATEGORIES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const ticketClassificationSchema = z.object({
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES),
  reason: z.string().min(10).max(500),
});

export const aiDraftSchema = z.object({
  draft: z.string().min(20).max(5_000),
});
