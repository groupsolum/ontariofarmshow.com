import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Event } from "@/types/event";
import { EventCard } from "@/components/events/event-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Outdoor Farm Shows in Ontario",
  description:
    "Find outdoor farm shows and agricultural exhibitions across Ontario. Browse open-air events featuring field demonstrations, equipment displays, and more.",
  alternates: {
    canonical: "https://ontariofarmshow.com/farm-shows/outdoor",
  },
};

export const revalidate = 3600;

export default async function OutdoorFarmShowsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("venue_type", "outdoor")
    .order("start_date", { ascending: true });

  const events = (data as Event[]) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Outdoor Farm Shows in Ontario"
        description={`Browse ${events.length} outdoor farm shows and agricultural exhibitions featuring field demonstrations and live displays across Ontario.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No outdoor farm shows currently listed. Check back soon!
        </p>
      )}
    </div>
  );
}
