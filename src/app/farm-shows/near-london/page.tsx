import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Event } from "@/types/event";
import { EventCard } from "@/components/events/event-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmailSignupForm } from "@/components/subscribe/email-signup-form";
import { MapWrapper } from "@/components/map/map-wrapper";

export const metadata: Metadata = {
  title: "Farm Shows Near London",
  description:
    "Find farm shows and agricultural events near London, Ontario. Browse upcoming fairs in Western Ontario with dates, locations, and ticket info.",
  alternates: {
    canonical: "https://ontariofarmshow.com/farm-shows/near-london",
  },
};

export const revalidate = 3600;

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function NearLondonPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  const londonLat = 42.9849;
  const londonLng = -81.2453;
  const radiusKm = 150;

  const events = ((data as Event[]) || []).filter(
    (e) => distanceKm(londonLat, londonLng, e.latitude, e.longitude) <= radiusKm
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Farm Shows Near London"
        description={`Browse ${events.length} farm shows and agricultural events within 150km of London, Ontario.`}
      />

      {events.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-xl border">
          <MapWrapper
            events={events}
            center={{ longitude: londonLng, latitude: londonLat }}
            zoom={8}
            className="h-[350px] md:h-[450px]"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No upcoming farm shows found near London.
        </p>
      )}

      <div className="mx-auto mt-12 max-w-lg text-center">
        <h2 className="mb-2 text-xl font-semibold">
          Stay Updated on London-Area Farm Shows
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Get notified when new events are added near London.
        </p>
        <EmailSignupForm source="near-london" />
      </div>
    </div>
  );
}
