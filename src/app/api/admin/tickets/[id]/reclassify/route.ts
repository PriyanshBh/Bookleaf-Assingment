import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, rateLimit, ApiError } from "@/lib/api";
import { classifyTicket } from "@/lib/ai/service";
import { Ticket } from "@/models/Ticket";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    rateLimit(`ai-classify:${session.userId}`, 20, 60 * 60_000);
    await connectToDatabase();
    const { id } = await context.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) throw new ApiError(404, "Ticket not found.", "NOT_FOUND");
    const result = await classifyTicket({ subject: ticket.subject, description: ticket.description });
    if (!result.ok) throw new ApiError(503, "Gemini is not configured.", "AI_NOT_CONFIGURED");
    const categoryPreserved = ticket.classificationSource === "MANUAL";
    const priorityPreserved = ticket.prioritySource === "MANUAL";
    if (!categoryPreserved) { ticket.category = result.value.category; ticket.classificationSource = "AI"; }
    if (!priorityPreserved) { ticket.priority = result.value.priority; ticket.prioritySource = "AI"; }
    ticket.aiProcessingStatus = "COMPLETED";
    ticket.aiClassificationReason = result.value.reason;
    ticket.aiTokenUsage = result.tokens;
    await ticket.save();
    return apiSuccess({
      category: ticket.category,
      priority: ticket.priority,
      reason: result.value.reason,
      preservedManualOverrides: { category: categoryPreserved, priority: priorityPreserved },
    });
  } catch (error) {
    return apiError(error);
  }
}
