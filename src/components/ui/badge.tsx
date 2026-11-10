import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue"; className?: string }) {
  const tones = { neutral: "bg-[#F1F3F0] text-[#59615B]", green: "bg-[#E8F1EA] text-[#326241]", amber: "bg-[#F8F0DE] text-[#805D19]", red: "bg-[#F7E8E5] text-[#934238]", blue: "bg-[#E8EEF4] text-[#3C5F79]" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function statusTone(status: string): "green" | "amber" | "blue" | "neutral" {
  if (status === "Resolved") return "green";
  if (status === "In Progress") return "blue";
  if (status === "Open") return "amber";
  return "neutral";
}

export function priorityTone(priority: string): "red" | "amber" | "blue" | "neutral" {
  if (priority === "Critical") return "red";
  if (priority === "High") return "amber";
  if (priority === "Medium") return "blue";
  return "neutral";
}
