import type { LucideIcon } from "lucide-react";
export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#D8DDD8] bg-white px-6 text-center"><span className="mb-4 rounded-full bg-[#EDF2ED] p-3 text-[#243D34]"><Icon className="size-5" /></span><h3 className="font-semibold text-[#202420]">{title}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-[#697069]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
