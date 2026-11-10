import { BookDetailView } from "@/components/author/book-detail-view";
export const metadata = { title: "Book details" };
export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BookDetailView id={id} />; }
