import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Event } from "@/types/event";
import { EventCard } from "@/components/events/event-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Free Farm Shows in Ontario",
  description:
    "Discover free farm shows and agricultural events across Ontario. No admission fee required for these farming exhibitions and fairs.",
  alternates: {
    canonical: "https://ontariofarmshow.com/farm-shows/free",
  },
};

export const revalidate = 3600;

export default async function FreeFarmShowsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("is_free", true)
    .order("start_date", { ascending: true });

  const events = (data as Event[]) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Free Farm Shows in Ontario"
        description={`Browse ${events.length} free farm shows and agricultural events across Ontario. No admission fee required.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No free farm shows currently listed. Check back soon!
        </p>
      )}
    </div>
  );
}
