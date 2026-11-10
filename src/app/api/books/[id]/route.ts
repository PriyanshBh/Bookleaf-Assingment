import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, ApiError } from "@/lib/api";
import { Book } from "@/models/Book";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    if (!session) throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "Book not found.", "NOT_FOUND");
    await connectToDatabase();
    const query = session.role === "AUTHOR" ? { _id: id, author: session.userId } : { _id: id };
    const book = await Book.findOne(query).lean();
    if (!book) throw new ApiError(404, "Book not found.", "NOT_FOUND");
    return apiSuccess(book);
  } catch (error) {
    return apiError(error);
  }
}
