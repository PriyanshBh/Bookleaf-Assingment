"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Home, LifeBuoy, LogOut, Menu, PlusCircle, Ticket, X } from "lucide-react";
import type { SessionPayload } from "@/lib/session-token";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { TourButton } from "@/components/tour-button";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon; tour?: string };

function SidebarContent({ session, author, nav, pathname, onNavigate, onLogout }: { session: SessionPayload; author: boolean; nav: NavItem[]; pathname: string; onNavigate: () => void; onLogout: () => void }) {
  const active = (href: string) => href === (author ? "/author" : "/admin") ? pathname === href : pathname.startsWith(href);
  return <div className="flex h-full flex-col">
    <div className="flex h-16 items-center gap-3 border-b border-[#E3E6E2] px-5"><span className="grid size-9 place-items-center rounded-lg bg-[#243D34] text-sm font-bold text-white">BL</span><div><p className="font-semibold leading-5">BookLeaf</p><p className="text-xs text-[#7C847E]">{author ? "Author portal" : "Support desk"}</p></div></div>
    <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">{nav.map(({ href, label, icon: Icon, tour }) => <Link key={href} href={href} data-tour={tour} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active(href) ? "bg-[#EDF2ED] text-[#243D34]" : "text-[#626A64] hover:bg-[#F3F5F2] hover:text-[#202420]")}><Icon className="size-4" />{label}</Link>)}</nav>
    <div className="border-t border-[#E3E6E2] p-4"><div className="mb-3 flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E6ECE7] text-sm font-semibold text-[#243D34]">{session.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{session.name}</p><p className="truncate text-xs text-[#7C847E]">{session.email}</p></div></div><Button variant="ghost" className="w-full justify-start" onClick={onLogout}><LogOut className="size-4" />Sign out</Button></div>
  </div>;
}

export function AppShell({ session, children }: { session: SessionPayload; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const author = session.role === "AUTHOR";
  const nav = author ? [
    { href: "/author", label: "Overview", icon: Home, tour: "overview" },
    { href: "/author/books", label: "My books", icon: BookOpen, tour: "books" },
    { href: "/author/tickets", label: "My tickets", icon: Ticket, tour: "tickets" },
    { href: "/author/tickets/new", label: "New request", icon: PlusCircle, tour: undefined },
  ] : [
    { href: "/admin", label: "Overview", icon: Home, tour: "overview" },
    { href: "/admin/tickets", label: "Ticket queue", icon: LifeBuoy, tour: "tickets" },
  ];
  const logout = async () => { await apiFetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); router.refresh(); };

  return <div className="min-h-screen bg-[#FAFAF8]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#E3E6E2] bg-white lg:block"><SidebarContent session={session} author={author} nav={nav} pathname={pathname} onNavigate={() => setOpen(false)} onLogout={logout} /></aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><button className="absolute inset-0 bg-[#18211C]/35" aria-label="Close navigation" onClick={() => setOpen(false)} /><aside className="relative h-full w-[min(82vw,19rem)] bg-white"><button className="absolute right-3 top-3 z-10 rounded-md p-2 text-[#697069]" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="size-5" /></button><SidebarContent session={session} author={author} nav={nav} pathname={pathname} onNavigate={() => setOpen(false)} onLogout={logout} /></aside></div>}
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E3E6E2] bg-[#FAFAF8]/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="rounded-lg border border-[#E0E4E0] bg-white p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button><p className="text-sm font-medium text-[#697069]">{author ? "Author workspace" : "Support operations"}</p></div><TourButton role={session.role} /></header><main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main></div>
  </div>;
}
