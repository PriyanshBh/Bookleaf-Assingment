import { redirect } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/author");
  return <main className="grid min-h-screen bg-[#F7F8F5] lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-[#243D34] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} /><div className="relative flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-white text-[#243D34]"><BookOpenCheck className="size-5" /></span><span className="text-lg font-semibold">BookLeaf Publishing</span></div><div className="relative max-w-xl"><p className="mb-5 text-sm font-medium uppercase tracking-[.18em] text-[#BFD0C5]">Author support, thoughtfully connected</p><h1 className="text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">Every book. Every question. One clear conversation.</h1><p className="mt-6 max-w-lg text-base leading-7 text-[#D7E1DA]">Track publishing progress, understand royalties, and resolve support requests through a secure workspace shared by authors and the BookLeaf team.</p></div><p className="relative text-xs text-[#AFC1B5]">BookLeaf Author Support & Communication Portal</p></section>
    <section className="flex items-center justify-center px-5 py-12 sm:px-8"><div className="w-full max-w-md"><div className="mb-8 lg:hidden"><span className="inline-flex items-center gap-2 font-semibold text-[#243D34]"><BookOpenCheck className="size-5" />BookLeaf Publishing</span></div><div className="rounded-2xl border border-[#E2E5E1] bg-white p-6 shadow-[0_20px_50px_rgba(39,53,44,.06)] sm:p-8"><h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2><p className="mt-2 text-sm leading-6 text-[#697069]">Sign in to continue to your BookLeaf workspace.</p><div className="mt-7"><LoginForm /></div><p className="mt-6 text-center text-xs leading-5 text-[#8A918B]">Demo buttons fill the seeded credentials. Access is role-protected on the server.</p></div></div></section>
  </main>;
}
