"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CalendarDays, Tag } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { TicketDetail } from "@/components/ticket-conversation";
import { TicketConversation } from "@/components/ticket-conversation";
import { Badge, priorityTone, statusTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthorTicketDetailView({ id }: { id: string }) {
  const { data, isLoading } = useQuery({ queryKey: ["ticket", id], queryFn: () => apiFetch<TicketDetail>(`/api/tickets/${id}`) });
  if (isLoading) return <Skeleton className="h-[680px]" />;
  if (!data) return <div className="surface p-6 text-sm text-[#934238]">Ticket not found.</div>;
  const ticket = data.ticket;
  return <><Link href="/author/tickets" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#59655E] hover:text-[#243D34]"><ArrowLeft className="size-4" />Back to tickets</Link><div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.13em] text-[#728078]">{ticket.ticketId}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{ticket.subject}</h1><div className="mt-3 flex flex-wrap gap-2"><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge><Badge>{ticket.category}</Badge></div></div><div className="surface grid gap-3 px-4 py-3 text-xs text-[#697069] sm:grid-cols-3 lg:max-w-xl"><span className="flex items-center gap-2"><BookOpen className="size-4" />{ticket.book?.title ?? "General / Account"}</span><span className="flex items-center gap-2"><CalendarDays className="size-4" />Opened {new Date(ticket.createdAt).toLocaleDateString("en-IN")}</span><span className="flex items-center gap-2"><Tag className="size-4" />{ticket.aiProcessingStatus === "COMPLETED" ? "AI assisted triage" : "Manual triage"}</span></div></div><TicketConversation id={id} viewerRole="AUTHOR" /></>;
}
