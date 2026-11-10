import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import {
  AI_PROCESSING_STATUSES,
  SOURCE_TYPES,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/lib/constants";

const ticketSchema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", default: null, index: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: TICKET_CATEGORIES, default: "General Inquiry", index: true },
    priority: { type: String, enum: TICKET_PRIORITIES, default: "Medium", index: true },
    status: { type: String, enum: TICKET_STATUSES, default: "Open", index: true },
    assignedAdmin: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    classificationSource: { type: String, enum: SOURCE_TYPES, default: "FALLBACK" },
    prioritySource: { type: String, enum: SOURCE_TYPES, default: "FALLBACK" },
    aiProcessingStatus: { type: String, enum: AI_PROCESSING_STATUSES, default: "PENDING" },
    aiClassificationReason: { type: String, default: null },
    aiTokenUsage: { type: Number, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ticketSchema.index({ author: 1, updatedAt: -1 });
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
export type TicketDocument = InferSchemaType<typeof ticketSchema> & { _id: mongoose.Types.ObjectId };
export const Ticket: Model<TicketDocument> =
  (mongoose.models.Ticket as Model<TicketDocument> | undefined) ?? mongoose.model<TicketDocument>("Ticket", ticketSchema);
