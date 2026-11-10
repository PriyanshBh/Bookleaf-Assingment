import { randomInt } from "node:crypto";
import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, ApiError } from "@/lib/api";
import { createTicketSchema } from "@/lib/validation";
import { classifyTicket } from "@/lib/ai/service";
import { Book } from "@/models/Book";
import { Ticket } from "@/models/Ticket";

export async function GET(request: Request) {
  try {
    const session = await requireSession("AUTHOR");
    if (!session) throw new ApiError(403, "Author access required.", "FORBIDDEN");
    await connectToDatabase();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim();
    const query: Record<string, unknown> = { author: session.userId };
    if (status && status !== "all") query.status = status;
    if (search) query.$or = [
      { ticketId: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
    const tickets = await Ticket.find(query)
      .populate("book", "title bookId")
      .sort({ updatedAt: -1 })
      .lean();
    return apiSuccess(tickets);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireSession("AUTHOR");
    if (!session) throw new ApiError(403, "Author access required.", "FORBIDDEN");
    const input = createTicketSchema.parse(await request.json());
    await connectToDatabase();

    let book = null;
    if (input.bookId) {
      book = await Book.findOne({ _id: input.bookId, author: session.userId });
      if (!book) throw new ApiError(400, "The selected book does not belong to this account.", "INVALID_BOOK");
    }

    let ticketId = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `BLT-${new Date().getFullYear()}-${randomInt(100000, 999999)}`;
      if (!(await Ticket.exists({ ticketId: candidate }))) {
        ticketId = candidate;
        break;
      }
    }
    if (!ticketId) throw new ApiError(503, "Could not allocate a ticket reference. Please retry.", "ID_GENERATION_FAILED");

    const ticket = await Ticket.create({
      ticketId,
      author: session.userId,
      book: book?._id ?? null,
      subject: input.subject,
      description: input.description,
      category: "General Inquiry",
      priority: "Medium",
      status: "Open",
      classificationSource: "FALLBACK",
      prioritySource: "FALLBACK",
      aiProcessingStatus: process.env.GEMINI_API_KEY ? "PENDING" : "NOT_CONFIGURED",
    });

    try {
      const classification = await classifyTicket({ subject: input.subject, description: input.description });
      if (classification.ok) {
        await Ticket.updateOne(
          { _id: ticket._id, classificationSource: { $ne: "MANUAL" }, prioritySource: { $ne: "MANUAL" } },
          {
            category: classification.value.category,
            priority: classification.value.priority,
            aiClassificationReason: classification.value.reason,
            classificationSource: "AI",
            prioritySource: "AI",
            aiProcessingStatus: "COMPLETED",
            aiTokenUsage: classification.tokens,
          },
        );
      } else {
        await Ticket.updateOne({ _id: ticket._id }, { aiProcessingStatus: "NOT_CONFIGURED" });
      }
    } catch (error) {
      console.error("Ticket AI classification failed", error instanceof Error ? error.message : "Unknown AI error");
      await Ticket.updateOne({ _id: ticket._id }, { aiProcessingStatus: "FAILED" });
    }

    const created = await Ticket.findById(ticket._id).populate("book", "title bookId").lean();
    return apiSuccess(created, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
