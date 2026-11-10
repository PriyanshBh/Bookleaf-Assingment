import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const internalNoteSchema = new Schema(
  {
    seedKey: { type: String, unique: true, sparse: true },
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

internalNoteSchema.index({ ticket: 1, createdAt: -1 });
export type InternalNoteDocument = InferSchemaType<typeof internalNoteSchema> & { _id: mongoose.Types.ObjectId };
export const InternalNote: Model<InternalNoteDocument> =
  (mongoose.models.InternalNote as Model<InternalNoteDocument> | undefined) ??
  mongoose.model<InternalNoteDocument>("InternalNote", internalNoteSchema);
