import type { LucideIcon } from "lucide-react";
export function MetricCard({ label, value, note, icon: Icon }: { label: string; value: string | number; note?: string; icon: LucideIcon }) {
  return <article className="rounded-xl border border-[#E3E6E2] bg-white p-5"><div className="flex items-start justify-between"><p className="text-sm font-medium text-[#697069]">{label}</p><span className="rounded-lg bg-[#EDF2ED] p-2 text-[#243D34]"><Icon className="size-4" /></span></div><p className="mt-4 text-2xl font-semibold tracking-tight text-[#202420]">{value}</p>{note && <p className="mt-1 text-xs text-[#7D847E]">{note}</p>}</article>;
}
