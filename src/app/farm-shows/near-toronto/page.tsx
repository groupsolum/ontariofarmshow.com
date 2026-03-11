import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Event } from "@/types/event";
import { EventCard } from "@/components/events/event-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmailSignupForm } from "@/components/subscribe/email-signup-form";
import { MapWrapper } from "@/components/map/map-wrapper";

export const metadata: Metadata = {
  title: "Farm Shows Near Toronto",
  description:
    "Find farm shows and agricultural events near Toronto, Ontario. Browse upcoming fairs in the GTA, Durham, York, Peel, and Halton regions with dates, locations, and ticket info.",
  alternates: {
    canonical: "https://ontariofarmshow.com/farm-shows/near-toronto",
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

export default async function NearTorontoPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  const torontoLat = 43.6532;
  const torontoLng = -79.3832;
  const radiusKm = 150;

  const events = ((data as Event[]) || []).filter(
    (e) => distanceKm(torontoLat, torontoLng, e.latitude, e.longitude) <= radiusKm
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Farm Shows Near Toronto"
        description={`Browse ${events.length} farm shows and agricultural events within 150km of Toronto, Ontario.`}
      />

      {events.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-xl border">
          <MapWrapper
            events={events}
            center={{ longitude: torontoLng, latitude: torontoLat }}
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
          No upcoming farm shows found near Toronto.
        </p>
      )}

      <div className="mx-auto mt-12 max-w-lg text-center">
        <h2 className="mb-2 text-xl font-semibold">
          Stay Updated on Toronto-Area Farm Shows
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Get notified when new events are added near Toronto.
        </p>
        <EmailSignupForm source="near-toronto" />
      </div>
    </div>
  );
}
