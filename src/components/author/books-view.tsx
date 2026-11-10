"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, Search } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { money } from "@/lib/serializers";
import type { BookView } from "@/types";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function BooksView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const deferred = useDeferredValue(search);
  const query = new URLSearchParams({ search: deferred, status }).toString();
  const { data, isLoading } = useQuery({ queryKey: ["books", deferred, status], queryFn: () => apiFetch<BookView[]>(`/api/books?${query}`) });
  return <><PageHeader eyebrow="Library" title="My books" description="Publication, distribution, sales, and royalty details for every title." />
    <div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-[#879088]" /><input className="field pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, ISBN, or genre" aria-label="Search books" /></div><select className="field sm:w-48" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by publication status"><option value="all">All statuses</option><option>Published</option><option>In Production</option></select></div>
    {isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-80" />)}</div> : !data?.length ? <EmptyState icon={BookMarked} title="No books found" description="Try clearing your search or selecting a different publication status." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((book) => <Link key={book._id} href={`/author/books/${book._id}`} className="group surface overflow-hidden transition-colors hover:border-[#B9C5BC]"><div className="flex items-start justify-between gap-3 border-b bg-[#FCFCFA] p-5"><div><p className="text-xs font-medium uppercase tracking-[.12em] text-[#788078]">{book.genre}</p><h2 className="mt-2 text-lg font-semibold leading-6 group-hover:text-[#345B49]">{book.title}</h2><p className="mt-1.5 text-xs text-[#7C847E]">{book.isbn ?? "ISBN not assigned"}</p></div><Badge tone={book.publicationStatus === "Published" ? "green" : "amber"}>{book.publicationStatus}</Badge></div><div className="grid grid-cols-2 gap-x-5 gap-y-4 p-5 text-sm"><div><p className="text-xs text-[#7C847E]">Copies sold</p><p className="mt-1 font-semibold">{book.totalCopiesSold ? book.totalCopiesSold.toLocaleString("en-IN") : "No sales yet"}</p></div><div><p className="text-xs text-[#7C847E]">MRP</p><p className="mt-1 font-semibold">{book.mrp ? money(book.mrp) : "Not available"}</p></div><div><p className="text-xs text-[#7C847E]">Royalty earned</p><p className="mt-1 font-semibold">{book.totalRoyaltyEarned ? money(book.totalRoyaltyEarned) : "—"}</p></div><div><p className="text-xs text-[#7C847E]">Pending</p><p className="mt-1 font-semibold">{book.royaltyPending ? money(book.royaltyPending) : "—"}</p></div></div><div className="border-t px-5 py-3 text-xs font-medium text-[#496555]">View book details →</div></Link>)}</div>}
  </>;
}
