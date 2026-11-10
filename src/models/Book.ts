import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { PUBLICATION_STATUSES } from "@/lib/constants";

const bookSchema = new Schema(
  {
    bookId: { type: String, required: true, unique: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true, default: null },
    genre: { type: String, required: true, trim: true },
    publicationDate: { type: Date, default: null },
    publicationStatus: { type: String, enum: PUBLICATION_STATUSES, required: true, index: true },
    productionStage: { type: String, default: null },
    mrp: { type: Number, default: null, min: 0 },
    royaltyPerCopy: { type: Number, default: 0, min: 0 },
    totalCopiesSold: { type: Number, default: 0, min: 0 },
    totalRoyaltyEarned: { type: Number, default: 0, min: 0 },
    royaltyPaid: { type: Number, default: 0, min: 0 },
    royaltyPending: { type: Number, default: 0, min: 0 },
    lastRoyaltyPayoutDate: { type: Date, default: null },
    printPartner: { type: String, default: null },
    distributionPlatforms: [{ type: String }],
  },
  { timestamps: true },
);

bookSchema.index({ author: 1, publicationStatus: 1 });
export type BookDocument = InferSchemaType<typeof bookSchema> & { _id: mongoose.Types.ObjectId };
export const Book: Model<BookDocument> =
  (mongoose.models.Book as Model<BookDocument> | undefined) ?? mongoose.model<BookDocument>("Book", bookSchema);
