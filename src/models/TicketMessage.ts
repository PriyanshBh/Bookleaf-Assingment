import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { ROLES } from "@/lib/constants";

const ticketMessageSchema = new Schema(
  {
    seedKey: { type: String, unique: true, sparse: true },
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ROLES, required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

ticketMessageSchema.index({ ticket: 1, createdAt: 1 });
export type TicketMessageDocument = InferSchemaType<typeof ticketMessageSchema> & { _id: mongoose.Types.ObjectId };
export const TicketMessage: Model<TicketMessageDocument> =
  (mongoose.models.TicketMessage as Model<TicketMessageDocument> | undefined) ??
  mongoose.model<TicketMessageDocument>("TicketMessage", ticketMessageSchema);
