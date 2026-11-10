"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Ticket as TicketIcon } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { TicketView } from "@/types";
import { PageHeader } from "@/components/page-header";
import { Badge, priorityTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function TicketsView() {
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("all"); const deferred = useDeferredValue(search);
  const query = new URLSearchParams({ search: deferred, status }).toString();
  const { data, isLoading } = useQuery({ queryKey: ["author-tickets", deferred, status], queryFn: () => apiFetch<TicketView[]>(`/api/tickets?${query}`) });
  return <><PageHeader eyebrow="Support" title="My tickets" description="Follow requests, read responses, and keep every conversation together." action={<Button asChild><Link href="/author/tickets/new"><Plus className="size-4" />New request</Link></Button>} />
    <div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-[#879088]" /><input className="field pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subject or ticket reference" /></div><select className="field sm:w-48" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select></div>
    {isLoading ? <Skeleton className="h-96" /> : !data?.length ? <EmptyState icon={TicketIcon} title="No tickets found" description={search || status !== "all" ? "Try clearing your search or filters." : "When you need help, start a support request and track it here."} action={!search && status === "all" ? <Button asChild><Link href="/author/tickets/new">Create a request</Link></Button> : undefined} /> : <div className="surface overflow-hidden"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[#F7F8F5] text-xs font-semibold uppercase tracking-wide text-[#707871]"><tr>{["Ticket", "Related book", "Category", "Priority", "Status", "Updated"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y">{data.map((ticket) => <tr key={ticket._id} className="hover:bg-[#FBFCFA]"><td className="max-w-xs px-4 py-4"><Link className="font-medium text-[#243D34] hover:underline" href={`/author/tickets/${ticket._id}`}>{ticket.subject}</Link><p className="mt-1 text-xs text-[#7D857E]">{ticket.ticketId}</p></td><td className="px-4 py-4 text-[#59615B]">{ticket.book?.title ?? "General / Account"}</td><td className="px-4 py-4 text-[#59615B]">{ticket.category}</td><td className="px-4 py-4"><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge></td><td className="px-4 py-4"><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge></td><td className="whitespace-nowrap px-4 py-4 text-[#697069]">{new Date(ticket.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td></tr>)}</tbody></table></div><div className="divide-y md:hidden">{data.map((ticket) => <Link key={ticket._id} href={`/author/tickets/${ticket._id}`} className="block p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{ticket.subject}</p><p className="mt-1 text-xs text-[#7D857E]">{ticket.ticketId} · {ticket.book?.title ?? "General"}</p></div><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge><Badge>{ticket.category}</Badge></div></Link>)}</div></div>}
  </>;
}
