"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, IndianRupee, Clock3, Copy, LifeBuoy, WalletCards } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/client-api";
import { money } from "@/lib/serializers";
import type { TicketView } from "@/types";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Badge, priorityTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Dashboard = { metrics: { totalBooks: number; publishedBooks: number; inProductionBooks: number; totalCopiesSold: number; totalRoyaltyEarned: number; royaltyPaid: number; royaltyPending: number; openTickets: number }; recentTickets: TicketView[]; royaltyByBook: Array<{ name: string; earned: number; paid: number }> };

export function AuthorDashboardView() {
  const { data, isLoading, error } = useQuery({ queryKey: ["author-dashboard"], queryFn: () => apiFetch<Dashboard>("/api/author/dashboard") });
  if (isLoading) return <><PageHeader title="Publishing overview" description="A live view of your books, earnings, and support activity." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-36" />)}</div></>;
  if (!data || error) return <div className="surface p-6 text-sm text-[#934238]">We couldn’t load your dashboard. Please refresh the page.</div>;
  const m = data.metrics;
  return <>
    <PageHeader eyebrow="Good to see you" title="Publishing overview" description="A live view of your books, earnings, and support activity." action={<Button asChild><Link href="/author/tickets/new">New support request</Link></Button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Publishing metrics">
      <MetricCard label="Books" value={m.totalBooks} note={`${m.publishedBooks} published · ${m.inProductionBooks} in production`} icon={BookOpen} />
      <MetricCard label="Copies sold" value={m.totalCopiesSold.toLocaleString("en-IN")} note="Across published titles" icon={Copy} />
      <MetricCard label="Royalty earned" value={money(m.totalRoyaltyEarned)} note={`${money(m.royaltyPaid)} paid`} icon={IndianRupee} />
      <MetricCard label="Royalty pending" value={money(m.royaltyPending)} note="Subject to quarterly payout policy" icon={WalletCards} />
      <MetricCard label="Open tickets" value={m.openTickets} note="Open or in progress" icon={LifeBuoy} />
      <MetricCard label="Published" value={m.publishedBooks} note="Live titles" icon={BookOpen} />
      <MetricCard label="In production" value={m.inProductionBooks} note="Not yet published" icon={Clock3} />
      <MetricCard label="Royalty paid" value={money(m.royaltyPaid)} note="Recorded payouts" icon={IndianRupee} />
    </section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.9fr]">
      <section className="surface min-h-[360px] p-5"><div className="mb-5"><h2 className="font-semibold">Royalty by title</h2><p className="mt-1 text-xs text-[#7A827C]">Earned and paid amounts from your published books</p></div>{data.royaltyByBook.length ? <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.royaltyByBook.slice(0, 6)} margin={{ left: 6, right: 8 }}><CartesianGrid vertical={false} stroke="#EDF0EC" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: "#697069" }} tickLine={false} axisLine={false} tickFormatter={(value: string) => value.length > 12 ? `${value.slice(0, 12)}…` : value} /><YAxis tick={{ fontSize: 11, fill: "#697069" }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} /><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ border: "1px solid #E3E6E2", borderRadius: 10, boxShadow: "none" }} /><Bar dataKey="earned" fill="#9BAEA1" radius={[4,4,0,0]} /><Bar dataKey="paid" fill="#243D34" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div> : <p className="py-24 text-center text-sm text-[#697069]">Royalty data will appear after your first sale.</p>}</section>
      <section className="surface overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Recent support activity</h2><p className="mt-1 text-xs text-[#7A827C]">Latest ticket updates</p></div><Link href="/author/tickets" className="text-sm font-medium text-[#345B49] hover:underline">View all</Link></div><div className="divide-y">{data.recentTickets.length ? data.recentTickets.map((ticket) => <Link key={ticket._id} href={`/author/tickets/${ticket._id}`} className="block px-5 py-4 transition-colors hover:bg-[#FAFBF9]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{ticket.subject}</p><p className="mt-1 text-xs text-[#7C847E]">{ticket.ticketId} · {new Date(ticket.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p></div><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge></div><div className="mt-3"><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge></div></Link>) : <p className="px-5 py-16 text-center text-sm text-[#697069]">No support activity yet.</p>}</div></section>
    </div>
  </>;
}
