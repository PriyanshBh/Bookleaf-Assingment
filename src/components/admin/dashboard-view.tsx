"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CircleCheck, CircleDot, Inbox, ListChecks, ShieldAlert, UserRoundX, Workflow } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/client-api";
import type { TicketView } from "@/types";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Badge, priorityTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type AdminDashboard = { metrics: { total: number; unassigned: number; status: Record<string, number>; priority: Record<string, number> }; categoryDistribution: Array<{ name: string; value: number }>; recent: TicketView[]; urgent: TicketView[] };

function TicketRow({ ticket }: { ticket: TicketView }) { return <Link href={`/admin/tickets/${ticket._id}`} className="block px-5 py-4 transition-colors hover:bg-[#FAFBF9]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{ticket.subject}</p><p className="mt-1 text-xs text-[#7C847E]">{ticket.ticketId} · {ticket.author.name}</p></div><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge></div><div className="mt-3 flex gap-2"><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>{ticket.assignedAdmin ? <Badge>{ticket.assignedAdmin.name}</Badge> : <Badge tone="amber">Unassigned</Badge>}</div></Link>; }

export function AdminDashboardView() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => apiFetch<AdminDashboard>("/api/admin/dashboard") });
  if (isLoading) return <><PageHeader title="Support operations" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div></>;
  if (!data) return <div className="surface p-6 text-sm text-[#934238]">The operations dashboard could not be loaded.</div>;
  const m = data.metrics;
  return <><PageHeader eyebrow="Admin workspace" title="Support operations" description="Live workload, urgency, and response activity across the BookLeaf author community." action={<Button asChild><Link href="/admin/tickets">Open ticket queue</Link></Button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total tickets" value={m.total} icon={ListChecks} /><MetricCard label="Open" value={m.status.Open ?? 0} icon={Inbox} /><MetricCard label="In progress" value={m.status["In Progress"] ?? 0} icon={Workflow} /><MetricCard label="Resolved" value={m.status.Resolved ?? 0} icon={CircleCheck} /><MetricCard label="Closed" value={m.status.Closed ?? 0} icon={CircleDot} /><MetricCard label="Critical" value={m.priority.Critical ?? 0} icon={ShieldAlert} /><MetricCard label="High priority" value={m.priority.High ?? 0} icon={AlertTriangle} /><MetricCard label="Unassigned" value={m.unassigned} icon={UserRoundX} /></section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <section className="surface p-5"><h2 className="font-semibold">Tickets by category</h2><p className="mt-1 text-xs text-[#7A827C]">Current queue distribution</p><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={data.categoryDistribution} margin={{ left: 6, right: 12 }}><CartesianGrid horizontal={false} stroke="#EDF0EC" /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#697069" }} /><YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#697069" }} tickFormatter={(value: string) => value.length > 22 ? `${value.slice(0,22)}…` : value} /><Tooltip contentStyle={{ border: "1px solid #E3E6E2", borderRadius: 10 }} /><Bar dataKey="value" fill="#496858" radius={[0,4,4,0]} /></BarChart></ResponsiveContainer></div></section>
      <section className="surface overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Urgent unresolved</h2><p className="mt-1 text-xs text-[#7A827C]">Critical and high-priority work</p></div><Link href="/admin/tickets?priority=High&sort=priority" className="text-sm font-medium text-[#345B49] hover:underline">View queue</Link></div><div className="divide-y">{data.urgent.length ? data.urgent.map((ticket) => <TicketRow key={ticket._id} ticket={ticket} />) : <p className="px-5 py-16 text-center text-sm text-[#697069]">No urgent unresolved tickets.</p>}</div></section>
    </div>
    <section className="surface mt-6 overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Recent incoming tickets</h2><p className="mt-1 text-xs text-[#7A827C]">Newest requests across all authors</p></div><Link href="/admin/tickets" className="text-sm font-medium text-[#345B49] hover:underline">View all</Link></div><div className="grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">{data.recent.map((ticket) => <TicketRow key={ticket._id} ticket={ticket} />)}</div></section>
  </>;
}
