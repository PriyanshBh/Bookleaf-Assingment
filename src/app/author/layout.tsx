import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
export default async function AuthorLayout({ children }: { children: React.ReactNode }) { const session = await requirePageSession("AUTHOR"); return <AppShell session={session}>{children}</AppShell>; }
