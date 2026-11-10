import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, ApiError } from "@/lib/api";
import { Book } from "@/models/Book";
import { Ticket } from "@/models/Ticket";

export async function GET() {
  try {
    const session = await requireSession("AUTHOR");
    if (!session) throw new ApiError(403, "Author access required.", "FORBIDDEN");
    await connectToDatabase();
    const [books, openTickets, recentTickets] = await Promise.all([
      Book.find({ author: session.userId }).lean(),
      Ticket.countDocuments({ author: session.userId, status: { $in: ["Open", "In Progress"] } }),
      Ticket.find({ author: session.userId }).select("ticketId subject status updatedAt priority").sort({ updatedAt: -1 }).limit(5).lean(),
    ]);
    const totals = books.reduce((summary, book) => ({
      copies: summary.copies + book.totalCopiesSold,
      earned: summary.earned + book.totalRoyaltyEarned,
      paid: summary.paid + book.royaltyPaid,
      pending: summary.pending + book.royaltyPending,
    }), { copies: 0, earned: 0, paid: 0, pending: 0 });
    return apiSuccess({
      metrics: {
        totalBooks: books.length,
        publishedBooks: books.filter((book) => book.publicationStatus === "Published").length,
        inProductionBooks: books.filter((book) => book.publicationStatus === "In Production").length,
        totalCopiesSold: totals.copies,
        totalRoyaltyEarned: totals.earned,
        royaltyPaid: totals.paid,
        royaltyPending: totals.pending,
        openTickets,
      },
      recentTickets,
      royaltyByBook: books.filter((book) => book.totalRoyaltyEarned > 0).map((book) => ({ name: book.title, earned: book.totalRoyaltyEarned, paid: book.royaltyPaid })),
    });
  } catch (error) {
    return apiError(error);
  }
}
