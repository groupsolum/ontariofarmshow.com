import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Event } from "@/types/event";
import { EventCard } from "@/components/events/event-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Indoor Farm Shows in Ontario",
  description:
    "Find indoor farm shows and agricultural exhibitions across Ontario. Browse events held in convention centres, arenas, and exhibition halls.",
  alternates: {
    canonical: "https://ontariofarmshow.com/farm-shows/indoor",
  },
};

export const revalidate = 3600;

export default async function IndoorFarmShowsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("venue_type", "indoor")
    .order("start_date", { ascending: true });

  const events = (data as Event[]) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Indoor Farm Shows in Ontario"
        description={`Browse ${events.length} indoor farm shows and agricultural exhibitions held in convention centres and exhibition halls across Ontario.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No indoor farm shows currently listed. Check back soon!
        </p>
      )}
    </div>
  );
}
