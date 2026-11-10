"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CalendarDays, IndianRupee, Factory, Globe2, Hash, Layers3 } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { money } from "@/lib/serializers";
import type { BookView } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookDetailView({ id }: { id: string }) {
  const { data: book, isLoading, error } = useQuery({ queryKey: ["book", id], queryFn: () => apiFetch<BookView>(`/api/books/${id}`) });
  if (isLoading) return <Skeleton className="h-[620px]" />;
  if (!book || error) return <div className="surface p-6"><p className="text-sm text-[#934238]">This book could not be found.</p><Button asChild variant="secondary" className="mt-4"><Link href="/author/books">Back to books</Link></Button></div>;
  return <><Link href="/author/books" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#59655E] hover:text-[#243D34]"><ArrowLeft className="size-4" />Back to books</Link>
    <section className="surface overflow-hidden"><div className="border-b bg-[#FCFCFA] p-6 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#728078]">{book.genre}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{book.title}</h1><p className="mt-2 text-sm text-[#697069]">Book reference {book.bookId}</p></div><Badge tone={book.publicationStatus === "Published" ? "green" : "amber"}>{book.publicationStatus}</Badge></div></div>
      <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_.9fr]"><div><h2 className="mb-4 font-semibold">Publishing details</h2><dl className="grid gap-4 sm:grid-cols-2">{[
        [Hash, "ISBN", book.isbn ?? "Not assigned yet"], [CalendarDays, "Publication date", book.publicationDate ? new Date(book.publicationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not published yet"], [Layers3, "Production stage", book.productionStage ?? "Not available"], [Factory, "Print partner", book.printPartner ?? "Not assigned yet"], [IndianRupee, "MRP", book.mrp ? money(book.mrp) : "Not available"], [BookOpen, "Royalty per copy", book.royaltyPerCopy ? money(book.royaltyPerCopy) : "No sales yet"],
      ].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof Hash; return <div key={String(label)} className="rounded-lg bg-[#F7F8F5] p-4"><div className="flex items-center gap-2 text-xs font-medium text-[#7A827C]"><ItemIcon className="size-4" />{String(label)}</div><dd className="mt-2 text-sm font-semibold">{String(value)}</dd></div>; })}</dl></div>
      <div><h2 className="mb-4 font-semibold">Distribution</h2><div className="rounded-lg border p-4"><div className="flex items-center gap-2 text-sm font-medium"><Globe2 className="size-4 text-[#486452]" />Available platforms</div>{book.distributionPlatforms.length ? <div className="mt-3 flex flex-wrap gap-2">{book.distributionPlatforms.map((platform) => <Badge key={platform}>{platform}</Badge>)}</div> : <p className="mt-3 text-sm text-[#697069]">Distribution begins after publication is complete.</p>}</div><Button asChild variant="secondary" className="mt-4 w-full"><Link href={`/author/tickets/new?book=${book._id}`}>Ask support about this book</Link></Button></div></div>
    </section>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Copies sold" value={book.totalCopiesSold.toLocaleString("en-IN")} icon={BookOpen} /><MetricCard label="Royalty earned" value={money(book.totalRoyaltyEarned)} icon={IndianRupee} /><MetricCard label="Royalty paid" value={money(book.royaltyPaid)} icon={IndianRupee} /><MetricCard label="Royalty pending" value={money(book.royaltyPending)} note={book.lastRoyaltyPayoutDate ? `Last payout ${new Date(book.lastRoyaltyPayoutDate).toLocaleDateString("en-IN")}` : "No payout recorded"} icon={IndianRupee} /></section>
  </>;
}
