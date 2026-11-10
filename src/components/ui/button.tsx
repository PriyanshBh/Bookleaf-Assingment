import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md"; asChild?: boolean };

export function Button({ className, variant = "primary", size = "md", asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#243D34]/35 disabled:pointer-events-none disabled:opacity-50", size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm", variant === "primary" && "bg-[#243D34] text-white hover:bg-[#344F43]", variant === "secondary" && "border border-[#DDE1DD] bg-white text-[#202420] hover:bg-[#F4F6F3]", variant === "ghost" && "text-[#59615B] hover:bg-[#EDF2ED] hover:text-[#243D34]", variant === "danger" && "bg-[#A33B32] text-white hover:bg-[#8F3028]", className)} {...props} />;
}
