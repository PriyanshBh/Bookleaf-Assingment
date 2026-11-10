"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { LoaderCircle, Paperclip } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { createTicketSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/client-api";
import type { BookView, TicketView } from "@/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

type Values = z.infer<typeof createTicketSchema>;
export function NewTicketForm({ initialBookId }: { initialBookId?: string }) {
  const router = useRouter();
  const { data: books } = useQuery({ queryKey: ["books", "ticket-picker"], queryFn: () => apiFetch<BookView[]>("/api/books") });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(createTicketSchema), defaultValues: { bookId: initialBookId ?? null, subject: "", description: "" } });
  const submit = async (values: Values) => {
    const ticket = await apiFetch<TicketView>("/api/tickets", { method: "POST", body: JSON.stringify(values) });
    toast.success("Support request created", { description: `${ticket.ticketId} is ready to track.` });
    router.push(`/author/tickets/${ticket._id}`);
  };
  return <><PageHeader eyebrow="New support request" title="How can we help?" description="Share enough detail for the support team to understand the issue. Your request will be saved even if AI classification is temporarily unavailable." />
    <form onSubmit={handleSubmit(submit)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" noValidate><section className="surface space-y-6 p-5 sm:p-7"><div><label className="label" htmlFor="bookId">Related book</label><select id="bookId" className="field" {...register("bookId")}><option value="">General / Account level</option>{books?.map((book) => <option key={book._id} value={book._id}>{book.title} · {book.publicationStatus}</option>)}</select><p className="mt-1.5 text-xs text-[#7C847E]">Choose General for account or package questions.</p></div><div><label className="label" htmlFor="subject">Subject</label><input id="subject" className="field" placeholder="Briefly describe the issue" {...register("subject")} />{errors.subject && <p className="mt-1.5 text-xs text-[#A33B32]">{errors.subject.message}</p>}</div><div><label className="label" htmlFor="description">Detailed description</label><textarea id="description" className="field min-h-44 resize-y" placeholder="What happened, when did you notice it, and what would help resolve it?" {...register("description")} />{errors.description && <p className="mt-1.5 text-xs text-[#A33B32]">{errors.description.message}</p>}</div><div className="rounded-lg border border-dashed bg-[#FAFBF9] p-4"><div className="flex items-center gap-2 text-sm font-medium text-[#697069]"><Paperclip className="size-4" />Attachments unavailable in this demo</div><p className="mt-1 text-xs leading-5 text-[#8A918B]">If support needs evidence such as printing-defect photos, they will ask you to provide it through a supported channel.</p></div><div className="flex justify-end"><Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="size-4 animate-spin" />}{isSubmitting ? "Creating request…" : "Submit request"}</Button></div></section><aside className="surface h-fit p-5"><h2 className="font-semibold">Before you submit</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[#626A64]"><li>• Select the affected book when possible.</li><li>• Include dates, platform names, and exact discrepancies.</li><li>• Never share bank passwords or one-time codes.</li><li>• Duplicate submissions can slow investigation.</li></ul></aside></form>
  </>;
}
