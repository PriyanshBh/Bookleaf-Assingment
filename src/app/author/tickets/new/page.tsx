import { NewTicketForm } from "@/components/author/new-ticket-form";
export const metadata = { title: "New support request" };
export default async function NewTicketPage({ searchParams }: { searchParams: Promise<{ book?: string }> }) { const { book } = await searchParams; return <NewTicketForm initialBookId={book} />; }
