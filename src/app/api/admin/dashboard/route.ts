import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, ApiError } from "@/lib/api";
import { Ticket } from "@/models/Ticket";
import "@/models/User";
import "@/models/Book";

export async function GET() {
  try {
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    await connectToDatabase();
    const [groups, recent, urgent] = await Promise.all([
      Ticket.aggregate<{ _id: string; count: number }>([
        { $facet: {
          status: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          priority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
          category: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
          total: [{ $count: "count" }],
          unassigned: [{ $match: { assignedAdmin: null } }, { $count: "count" }],
        } },
      ]),
      Ticket.find().populate("author", "name").populate("book", "title").sort({ createdAt: -1 }).limit(6).lean(),
      Ticket.find({ priority: { $in: ["Critical", "High"] }, status: { $in: ["Open", "In Progress"] } })
        .populate("author", "name").sort({ createdAt: 1 }).limit(6).lean(),
    ]);
    const facets = groups[0] as unknown as {
      status: Array<{ _id: string; count: number }>;
      priority: Array<{ _id: string; count: number }>;
      category: Array<{ _id: string; count: number }>;
      total: Array<{ count: number }>;
      unassigned: Array<{ count: number }>;
    };
    const toMap = (values: Array<{ _id: string; count: number }>) => Object.fromEntries(values.map((value) => [value._id, value.count]));
    return apiSuccess({
      metrics: { total: facets.total[0]?.count ?? 0, unassigned: facets.unassigned[0]?.count ?? 0, status: toMap(facets.status), priority: toMap(facets.priority) },
      categoryDistribution: facets.category.map((item) => ({ name: item._id, value: item.count })),
      recent,
      urgent,
    });
  } catch (error) {
    return apiError(error);
  }
}
