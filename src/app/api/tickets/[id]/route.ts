import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, ApiError } from "@/lib/api";
import { getAccessibleTicket } from "@/lib/ticket-access";
import { Ticket } from "@/models/Ticket";
import { TicketMessage } from "@/models/TicketMessage";
import "@/models/User";
import "@/models/Book";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    if (!session) throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    await connectToDatabase();
    const { id } = await context.params;
    await getAccessibleTicket(id, session);
    const [ticket, messages] = await Promise.all([
      Ticket.findById(id)
        .populate("author", "name email authorId city phone joinedDate")
        .populate("book")
        .populate("assignedAdmin", "name email")
        .lean(),
      TicketMessage.find({ ticket: id }).populate("sender", "name").sort({ createdAt: 1 }).lean(),
    ]);
    return apiSuccess({ ticket, messages });
  } catch (error) {
    return apiError(error);
  }
}
