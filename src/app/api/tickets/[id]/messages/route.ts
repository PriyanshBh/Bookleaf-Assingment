import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, ApiError } from "@/lib/api";
import { messageSchema } from "@/lib/validation";
import { getAccessibleTicket } from "@/lib/ticket-access";
import { Ticket } from "@/models/Ticket";
import { TicketMessage } from "@/models/TicketMessage";
import "@/models/User";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    if (!session) throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    await connectToDatabase();
    const { id } = await context.params;
    await getAccessibleTicket(id, session);
    const messages = await TicketMessage.find({ ticket: id }).populate("sender", "name").sort({ createdAt: 1 }).lean();
    return apiSuccess(messages);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const session = await requireSession();
    if (!session) throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    const input = messageSchema.parse(await request.json());
    await connectToDatabase();
    const { id } = await context.params;
    const ticket = await getAccessibleTicket(id, session);
    if (ticket.status === "Closed") throw new ApiError(409, "Closed tickets cannot receive new replies.", "TICKET_CLOSED");
    const message = await TicketMessage.create({ ticket: ticket._id, sender: session.userId, senderRole: session.role, content: input.content });
    await Ticket.updateOne({ _id: ticket._id }, { $set: { updatedAt: new Date() } });
    return apiSuccess(message, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
