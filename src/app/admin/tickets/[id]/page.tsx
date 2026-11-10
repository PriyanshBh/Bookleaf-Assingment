import { AdminTicketDetailView } from "@/components/admin/ticket-detail-view";
export const metadata = { title: "Ticket workspace" };
export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminTicketDetailView id={id} />; }
