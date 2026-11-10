import { AuthorTicketDetailView } from "@/components/author/ticket-detail-view";
export const metadata = { title: "Ticket conversation" };
export default async function AuthorTicketPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AuthorTicketDetailView id={id} />; }
