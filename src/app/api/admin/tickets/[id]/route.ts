import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, ApiError } from "@/lib/api";
import { updateTicketSchema } from "@/lib/validation";
import { getAccessibleTicket } from "@/lib/ticket-access";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    const input = updateTicketSchema.parse(await request.json());
    await connectToDatabase();
    const { id } = await context.params;
    const ticket = await getAccessibleTicket(id, session);
    if (input.category) { ticket.category = input.category; ticket.classificationSource = "MANUAL"; }
    if (input.priority) { ticket.priority = input.priority; ticket.prioritySource = "MANUAL"; }
    if (input.status) {
      ticket.status = input.status;
      if (input.status === "Resolved") ticket.resolvedAt = new Date();
      if (input.status === "Closed") ticket.closedAt = new Date();
      if (input.status === "Open" || input.status === "In Progress") { ticket.resolvedAt = null; ticket.closedAt = null; }
    }
    await ticket.save();
    return apiSuccess(ticket);
  } catch (error) {
    return apiError(error);
  }
}
