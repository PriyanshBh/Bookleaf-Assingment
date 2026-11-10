import type { TicketCategory, TicketPriority, TicketStatus } from "@/lib/constants";

export type BookView = {
  _id: string; bookId: string; title: string; isbn: string | null; genre: string;
  publicationDate: string | null; publicationStatus: "Published" | "In Production"; productionStage: string | null;
  mrp: number | null; royaltyPerCopy: number; totalCopiesSold: number; totalRoyaltyEarned: number;
  royaltyPaid: number; royaltyPending: number; lastRoyaltyPayoutDate: string | null; printPartner: string | null;
  distributionPlatforms: string[];
};

export type UserSummary = { _id: string; name: string; email?: string; authorId?: string; city?: string; phone?: string };
export type TicketView = {
  _id: string; ticketId: string; subject: string; description: string; category: TicketCategory; priority: TicketPriority;
  status: TicketStatus; aiProcessingStatus: string; aiClassificationReason?: string | null; classificationSource: string; prioritySource: string;
  author: UserSummary; book?: Pick<BookView, "_id" | "title" | "bookId"> | BookView | null; assignedAdmin?: UserSummary | null;
  createdAt: string; updatedAt: string;
};
export type MessageView = { _id: string; senderRole: "AUTHOR" | "ADMIN"; sender: UserSummary; content: string; createdAt: string };
export type NoteView = { _id: string; admin: UserSummary; content: string; createdAt: string };
