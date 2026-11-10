import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { const session = await requirePageSession("ADMIN"); return <AppShell session={session}>{children}</AppShell>; }
