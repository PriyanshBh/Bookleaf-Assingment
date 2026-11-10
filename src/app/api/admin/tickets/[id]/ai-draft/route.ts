import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, rateLimit, ApiError } from "@/lib/api";
import { generateDraft } from "@/lib/ai/service";
import { Ticket } from "@/models/Ticket";
import { TicketMessage } from "@/models/TicketMessage";
import "@/models/User";
import "@/models/Book";

type DraftTicket = {
  _id: unknown;
  category: Parameters<typeof generateDraft>[0]["category"];
  subject: string;
  description: string;
  author: { name: string };
  book?: { title: string; isbn?: string | null; publicationStatus: string; productionStage?: string | null; totalCopiesSold: number; royaltyPending: number } | null;
};

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    rateLimit(`ai-draft:${session.userId}`, 12, 60 * 60_000);
    await connectToDatabase();
    const { id } = await context.params;
    const ticket = await Ticket.findById(id).populate("author", "name").populate("book").lean() as DraftTicket | null;
    if (!ticket) throw new ApiError(404, "Ticket not found.", "NOT_FOUND");
    const messages = await TicketMessage.find({ ticket: id }).select("senderRole content").sort({ createdAt: 1 }).lean();
    const result = await generateDraft({
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      authorName: ticket.author.name,
      book: ticket.book ?? null,
      messages: messages.map((message) => ({ senderRole: message.senderRole, content: message.content })),
    });
    if (!result.ok) throw new ApiError(503, "Gemini is not configured. You can still write and send a manual reply.", "AI_NOT_CONFIGURED");
    return apiSuccess({ draft: result.value, tokenUsage: result.tokens });
  } catch (error) {
    return apiError(error);
  }
}
