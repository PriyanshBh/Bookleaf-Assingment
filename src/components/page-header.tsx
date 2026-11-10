export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[.14em] text-[#728078]">{eyebrow}</p>}<h1 className="text-2xl font-semibold tracking-tight text-[#202420] sm:text-[1.7rem]">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#697069]">{description}</p>}</div>{action}</div>;
}
