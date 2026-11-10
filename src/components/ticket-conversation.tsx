"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import type { MessageView, TicketView } from "@/types";
import { Button } from "@/components/ui/button";

export type TicketDetail = { ticket: TicketView; messages: MessageView[] };

export function TicketConversation({ id, viewerRole, compact = false }: { id: string; viewerRole: "AUTHOR" | "ADMIN"; compact?: boolean }) {
  const client = useQueryClient();
  const [content, setContent] = useState("");
  const query = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => apiFetch<TicketDetail>(`/api/tickets/${id}`),
    refetchInterval: (state) => {
      const status = state.state.data?.ticket.status;
      return status === "Open" || status === "In Progress" ? 5_000 : false;
    },
    refetchIntervalInBackground: false,
  });
  const send = useMutation({
    mutationFn: () => apiFetch(`/api/tickets/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
    onSuccess: async () => { setContent(""); await client.invalidateQueries({ queryKey: ["ticket", id] }); toast.success("Reply sent"); },
    onError: (error) => toast.error(error.message),
  });
  if (query.isLoading) return <div className="surface h-96 animate-pulse bg-[#F0F2EF]" />;
  if (!query.data) return <div className="surface p-6 text-sm text-[#934238]">The conversation could not be loaded.</div>;
  const { ticket, messages } = query.data;
  return <section className="surface overflow-hidden"><div className="border-b px-5 py-4"><h2 className="font-semibold">Conversation</h2><p className="mt-1 text-xs text-[#7C847E]">Updates refresh automatically while this ticket is active.</p></div><div className={compact ? "max-h-[560px] overflow-y-auto p-4 sm:p-5" : "p-4 sm:p-6"}>
    <div className="space-y-5"><article className="max-w-[92%] rounded-xl rounded-tl-sm border border-[#DEE3DE] bg-[#F7F9F6] p-4 sm:max-w-[78%]"><div className="mb-2 flex items-center gap-2"><span className="text-xs font-semibold text-[#3E5647]">{ticket.author.name}</span><span className="text-[11px] text-[#889089]">Original request · {new Date(ticket.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span></div><p className="whitespace-pre-wrap text-sm leading-6 text-[#343A35]">{ticket.description}</p></article>
      {messages.map((message) => { const ownSide = message.senderRole === viewerRole; return <article key={message._id} className={`max-w-[92%] rounded-xl p-4 sm:max-w-[78%] ${ownSide ? "ml-auto rounded-tr-sm bg-[#243D34] text-white" : "rounded-tl-sm border border-[#DEE3DE] bg-[#F7F9F6] text-[#343A35]"}`}><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`text-xs font-semibold ${ownSide ? "text-[#E2ECE5]" : "text-[#3E5647]"}`}>{message.sender.name}</span><span className={`text-[11px] ${ownSide ? "text-[#B8C9BE]" : "text-[#889089]"}`}>{new Date(message.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span></div><p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p></article>; })}
    </div>
  </div>{ticket.status !== "Closed" ? <div className="border-t bg-[#FCFCFA] p-4 sm:p-5"><label className="label" htmlFor={`reply-${id}`}>Reply to {viewerRole === "ADMIN" ? ticket.author.name : "BookLeaf support"}</label><textarea id={`reply-${id}`} className="field min-h-28 resize-y bg-white" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a clear reply…" maxLength={5000} /><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-[#858D86]">{content.length}/5000</p><Button onClick={() => send.mutate()} disabled={content.trim().length < 2 || send.isPending}>{send.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}{send.isPending ? "Sending…" : "Send reply"}</Button></div></div> : <div className="border-t bg-[#F7F8F5] px-5 py-4 text-sm text-[#697069]">This ticket is closed and can no longer receive replies.</div>}</section>;
}
