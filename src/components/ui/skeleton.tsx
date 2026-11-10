import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) { return <div className={cn("animate-pulse rounded-lg bg-[#E9ECE8]", className)} />; }
