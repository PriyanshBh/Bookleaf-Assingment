import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, ApiError } from "@/lib/api";
import { Book } from "@/models/Book";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!session) throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    await connectToDatabase();
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const status = url.searchParams.get("status");
    const query: Record<string, unknown> = session.role === "AUTHOR" ? { author: session.userId } : {};
    if (status && status !== "all") query.publicationStatus = status;
    if (search) query.$or = [
      { title: { $regex: search, $options: "i" } },
      { isbn: { $regex: search, $options: "i" } },
      { genre: { $regex: search, $options: "i" } },
    ];
    const books = await Book.find(query).sort({ publicationStatus: 1, publicationDate: -1, title: 1 }).lean();
    return apiSuccess(books);
  } catch (error) {
    return apiError(error);
  }
}
