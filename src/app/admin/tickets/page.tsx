import { TicketQueueView } from "@/components/admin/ticket-queue-view";
export const metadata = { title: "Ticket queue" };
export default async function AdminTicketsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const raw = await searchParams; const initial = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])); return <TicketQueueView initial={initial} />; }
