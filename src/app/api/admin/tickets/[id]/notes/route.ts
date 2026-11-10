import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, ApiError } from "@/lib/api";
import { noteSchema } from "@/lib/validation";
import { getAccessibleTicket } from "@/lib/ticket-access";
import { InternalNote } from "@/models/InternalNote";
import "@/models/User";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    await connectToDatabase();
    const { id } = await context.params;
    await getAccessibleTicket(id, session);
    const notes = await InternalNote.find({ ticket: id }).populate("admin", "name").sort({ createdAt: -1 }).lean();
    return apiSuccess(notes);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    const input = noteSchema.parse(await request.json());
    await connectToDatabase();
    const { id } = await context.params;
    const ticket = await getAccessibleTicket(id, session);
    const note = await InternalNote.create({ ticket: ticket._id, admin: session.userId, content: input.content });
    return apiSuccess(note, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
