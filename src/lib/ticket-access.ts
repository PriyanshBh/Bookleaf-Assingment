import "server-only";
import mongoose from "mongoose";
import type { SessionPayload } from "@/lib/session-token";
import { Ticket } from "@/models/Ticket";
import { ApiError } from "@/lib/api";

export async function getAccessibleTicket(id: string, session: SessionPayload) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "Ticket not found.", "NOT_FOUND");
  const query = session.role === "AUTHOR" ? { _id: id, author: session.userId } : { _id: id };
  const ticket = await Ticket.findOne(query);
  if (!ticket) throw new ApiError(404, "Ticket not found.", "NOT_FOUND");
  return ticket;
}
