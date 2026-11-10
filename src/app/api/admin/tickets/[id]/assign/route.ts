import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, ApiError } from "@/lib/api";
import { getAccessibleTicket } from "@/lib/ticket-access";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    await connectToDatabase();
    const { id } = await context.params;
    const ticket = await getAccessibleTicket(id, session);
    ticket.assignedAdmin = new mongoose.Types.ObjectId(session.userId);
    if (ticket.status === "Open") ticket.status = "In Progress";
    await ticket.save();
    return apiSuccess({ assignedAdmin: { _id: session.userId, name: session.name }, status: ticket.status });
  } catch (error) {
    return apiError(error);
  }
}
import mongoose from "mongoose";
