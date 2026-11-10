import type { PipelineStage } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess, ApiError } from "@/lib/api";
import { escapeRegex } from "@/lib/utils";
import { Ticket } from "@/models/Ticket";

export async function GET(request: Request) {
  try {
    const session = await requireSession("ADMIN");
    if (!session) throw new ApiError(403, "Admin access required.", "FORBIDDEN");
    await connectToDatabase();
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(5, Number(params.get("pageSize")) || 10));
    const match: Record<string, unknown> = {};
    for (const key of ["status", "category", "priority"] as const) {
      const value = params.get(key);
      if (value && value !== "all") match[key] = value;
    }
    const search = params.get("search")?.trim();
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      match.$or = [{ ticketId: regex }, { subject: regex }];
    }
    const from = params.get("from");
    const to = params.get("to");
    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
      match.createdAt = createdAt;
    }

    const sort = params.get("sort") ?? "newest";
    const sortStage: Record<string, 1 | -1> = sort === "oldest" ? { createdAt: 1 } : sort === "priority" ? { priorityRank: -1, createdAt: 1 } : { createdAt: -1 };
    const pipeline: PipelineStage[] = [
      { $match: match },
      { $addFields: { priorityRank: { $switch: { branches: [
        { case: { $eq: ["$priority", "Critical"] }, then: 4 },
        { case: { $eq: ["$priority", "High"] }, then: 3 },
        { case: { $eq: ["$priority", "Medium"] }, then: 2 },
      ], default: 1 } } } },
      { $sort: sortStage },
      { $facet: {
        rows: [
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
          { $unwind: "$author" },
          { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "book" } },
          { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "users", localField: "assignedAdmin", foreignField: "_id", as: "assignedAdmin" } },
          { $unwind: { path: "$assignedAdmin", preserveNullAndEmptyArrays: true } },
          { $project: { "author.passwordHash": 0, priorityRank: 0 } },
        ],
        count: [{ $count: "total" }],
      } },
    ];
    const [result] = await Ticket.aggregate(pipeline);
    const total = result?.count?.[0]?.total ?? 0;
    return apiSuccess({ rows: result?.rows ?? [], pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) } });
  } catch (error) {
    return apiError(error);
  }
}
