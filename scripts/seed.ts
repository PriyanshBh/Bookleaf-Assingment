import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import sampleData from "../data/bookleaf_sample_data.json";

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required for seeding.");
  const databaseName = new URL(uri).pathname.replace(/^\//, "");
  if (process.env.NODE_ENV === "production" || !/(bookleaf|demo|dev)/i.test(databaseName)) {
    throw new Error(`Refusing to seed non-demo database '${databaseName || "unknown"}'.`);
  }

  const [{ User }, { Book }, { Ticket }, { TicketMessage }, { InternalNote }] = await Promise.all([
    import("../src/models/User"),
    import("../src/models/Book"),
    import("../src/models/Ticket"),
    import("../src/models/TicketMessage"),
    import("../src/models/InternalNote"),
  ]);
  await mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8_000 });

  const authorPassword = process.env.DEMO_AUTHOR_PASSWORD;
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD;
  if (!authorPassword || !adminPassword) throw new Error("DEMO_AUTHOR_PASSWORD and DEMO_ADMIN_PASSWORD are required.");
  const [authorHash, adminHash] = await Promise.all([bcrypt.hash(authorPassword, 12), bcrypt.hash(adminPassword, 12)]);

  const authorByExternalId = new Map<string, InstanceType<typeof User>>();
  for (const author of sampleData.authors) {
    const record = await User.findOneAndUpdate(
      { authorId: author.authorId },
      { ...author, passwordHash: authorHash, role: "AUTHOR", joinedDate: new Date(author.joinedDate) },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    authorByExternalId.set(author.authorId, record);
  }

  const admin = await User.findOneAndUpdate(
    { email: (process.env.DEMO_ADMIN_EMAIL ?? "admin@bookleaf.demo").toLowerCase() },
    {
      name: "Aditi Verma",
      email: (process.env.DEMO_ADMIN_EMAIL ?? "admin@bookleaf.demo").toLowerCase(),
      passwordHash: adminHash,
      role: "ADMIN",
      city: "Delhi",
      phone: "+91 98765 11999",
      joinedDate: new Date("2022-06-01"),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  const bookByExternalId = new Map<string, InstanceType<typeof Book>>();
  for (const book of sampleData.books) {
    const author = authorByExternalId.get(book.authorId);
    if (!author) throw new Error(`Missing author ${book.authorId} for ${book.bookId}`);
    const record = await Book.findOneAndUpdate(
      { bookId: book.bookId },
      {
        ...book,
        author: author._id,
        publicationDate: book.publicationDate ? new Date(book.publicationDate) : null,
        lastRoyaltyPayoutDate: book.lastRoyaltyPayoutDate ? new Date(book.lastRoyaltyPayoutDate) : null,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    bookByExternalId.set(book.bookId, record);
  }

  const tickets = [
    { ticketId: "BLT-2026-1001", authorId: "AUTH-001", bookId: "BL-1001", subject: "Quarterly royalty payout is still pending", description: "My dashboard shows a pending royalty balance after the last quarter, but I have not received the payout in my linked bank account. Please confirm the payout status and whether any verification is required.", category: "Royalty & Payments", priority: "High", status: "In Progress", classificationSource: "AI", prioritySource: "AI", aiClassificationReason: "A delayed royalty payout has direct financial impact and requires account-level investigation.", assigned: true },
    { ticketId: "BLT-2026-1002", authorId: "AUTH-002", bookId: "BL-1004", subject: "ISBN is different on the Amazon listing", description: "The ISBN shown on the Amazon India product page does not match the ISBN printed in my book. This may confuse readers and affect catalog records. Please have the listing corrected.", category: "ISBN & Metadata Issues", priority: "High", status: "Open", classificationSource: "AI", prioritySource: "AI", aiClassificationReason: "An ISBN mismatch is a high-priority catalog integrity issue.", assigned: false },
    { ticketId: "BLT-2026-1003", authorId: "AUTH-003", bookId: "BL-1006", subject: "Several copies have loose pages", description: "Five copies from my recent author order have loose pages near the centre binding. I can share photographs of the affected copies and packaging label for verification.", category: "Printing & Quality", priority: "High", status: "In Progress", classificationSource: "AI", prioritySource: "AI", aiClassificationReason: "Multiple defective copies indicate a verified-quality workflow and possible reprint.", assigned: true },
    { ticketId: "BLT-2026-1004", authorId: "AUTH-004", bookId: "BL-1008", subject: "Book showing unavailable on Flipkart", description: "My book has been live for months, but Flipkart has shown it as unavailable for the last three days. Amazon and the BookLeaf Store are still active. Can the stock feed be checked?", category: "Distribution & Availability", priority: "Medium", status: "Resolved", classificationSource: "AI", prioritySource: "AI", aiClassificationReason: "A single-channel stock synchronization issue affects sales but other channels remain active.", assigned: true },
    { ticketId: "BLT-2026-1005", authorId: "AUTH-005", bookId: "BL-1011", subject: "Typesetting stage has not changed", description: "The production tracker has remained at Typesetting for more than two weeks. I approved the revised manuscript already and would like to know the next step and realistic timeline.", category: "Book Status & Production Updates", priority: "Medium", status: "Open", classificationSource: "AI", prioritySource: "AI", aiClassificationReason: "A two-week production delay warrants review but no critical impact is described.", assigned: false },
    { ticketId: "BLT-2026-1006", authorId: "AUTH-006", bookId: null, subject: "Can I update my author biography?", description: "I would like to replace the author biography used across my published titles. Please tell me what format and length you need and where I should send the revised copy.", category: "General Inquiry", priority: "Low", status: "Closed", classificationSource: "AI", prioritySource: "AI", aiClassificationReason: "This is a routine account-level metadata request without time-sensitive impact.", assigned: true }
  ] as const;

  const ticketById = new Map<string, InstanceType<typeof Ticket>>();
  for (const item of tickets) {
    const author = authorByExternalId.get(item.authorId)!;
    const book = item.bookId ? bookByExternalId.get(item.bookId)! : null;
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: item.ticketId },
      {
        author: author._id,
        book: book?._id ?? null,
        subject: item.subject,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        assignedAdmin: item.assigned ? admin._id : null,
        classificationSource: item.classificationSource,
        prioritySource: item.prioritySource,
        aiProcessingStatus: "COMPLETED",
        aiClassificationReason: item.aiClassificationReason,
        resolvedAt: item.status === "Resolved" || item.status === "Closed" ? new Date("2026-10-12") : null,
        closedAt: item.status === "Closed" ? new Date("2026-10-14") : null,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    ticketById.set(item.ticketId, ticket);
  }

  const seededMessages = [
    { seedKey: "msg-1001-admin", ticketId: "BLT-2026-1001", sender: admin, senderRole: "ADMIN", content: "Thank you for flagging this, Priya. I have assigned the payout check to our accounts review. Your balance is above the minimum threshold, so we are verifying the linked bank details and quarter-end batch status." },
    { seedKey: "msg-1001-author", ticketId: "BLT-2026-1001", sender: authorByExternalId.get("AUTH-001")!, senderRole: "AUTHOR", content: "Thank you. My bank details have not changed since the previous successful payout." },
    { seedKey: "msg-1003-admin", ticketId: "BLT-2026-1003", sender: admin, senderRole: "ADMIN", content: "I’m sorry these copies arrived in that condition. Please reply with clear photographs of the loose pages and the shipping label. Once verified, the affected copies qualify for a free reprint." },
    { seedKey: "msg-1004-admin", ticketId: "BLT-2026-1004", sender: admin, senderRole: "ADMIN", content: "The Flipkart stock feed has synchronized again and the listing is available. We will continue monitoring the channel for the next 48 hours." },
    { seedKey: "msg-1006-admin", ticketId: "BLT-2026-1006", sender: admin, senderRole: "ADMIN", content: "You can send a revised biography of up to 150 words in reply to this ticket. We will update the account record and confirm which live listings can be refreshed." }
  ] as const;
  for (const message of seededMessages) {
    await TicketMessage.findOneAndUpdate(
      { seedKey: message.seedKey },
      { ticket: ticketById.get(message.ticketId)!._id, sender: message.sender._id, senderRole: message.senderRole, content: message.content },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  await InternalNote.findOneAndUpdate(
    { seedKey: "note-1001-accounts" },
    { ticket: ticketById.get("BLT-2026-1001")!._id, admin: admin._id, content: "Check whether the Q3 payout batch rejected this account; do not state a cause until finance confirms." },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  const counts = await Promise.all([User.countDocuments({ role: "AUTHOR" }), Book.countDocuments(), Ticket.countDocuments()]);
  console.log(`Seed complete: ${counts[0]} authors, ${counts[1]} books, ${counts[2]} tickets.`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
