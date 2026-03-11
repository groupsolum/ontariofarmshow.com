import { Metadata } from "next";
import { MapPin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";
import { EventCard } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { PageHeader } from "@/components/shared/page-header";
import { MapWrapper } from "@/components/map/map-wrapper";
import type { Event, EventFilters as EventFiltersType } from "@/types/event";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Farm Shows Directory",
  description:
    "Browse all farm shows, agricultural fairs, and farming events across Ontario. Filter by region, event type, date, and more.",
  openGraph: {
    title: "Farm Shows Directory | Ontario Farm Shows",
    description:
      "Browse all farm shows, agricultural fairs, and farming events across Ontario. Filter by region, event type, date, and more.",
    url: `${siteConfig.url}/farm-shows`,
    images: [siteConfig.ogImage],
  },
};

interface FarmShowsPageProps {
  searchParams: Promise<{
    region?: string;
    type?: string;
    venue?: string;
    free?: string;
    from?: string;
    to?: string;
    featured?: string;
    q?: string;
  }>;
}

async function getFilteredEvents(filters: EventFiltersType) {
  const supabase = createAdminClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  if (filters.region) {
    query = query.eq("region", filters.region);
  }

  if (filters.event_type) {
    query = query.eq("event_type", filters.event_type);
  }

  if (filters.venue_type) {
    query = query.eq("venue_type", filters.venue_type);
  }

  if (filters.is_free) {
    query = query.eq("is_free", true);
  }

  if (filters.from) {
    query = query.gte("start_date", filters.from);
  }

  if (filters.to) {
    query = query.lte("start_date", filters.to);
  }

  if (filters.featured) {
    query = query.eq("is_featured", true);
  }

  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,city.ilike.%${filters.q}%,venue_name.ilike.%${filters.q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }

  return (data as Event[]) ?? [];
}

export default async function FarmShowsPage({ searchParams }: FarmShowsPageProps) {
  const params = await searchParams;

  const filters: EventFiltersType = {
    region: params.region,
    event_type: params.type,
    venue_type: params.venue,
    is_free: params.free === "true",
    from: params.from,
    to: params.to,
    featured: params.featured === "true",
    q: params.q,
  };

  const events = await getFilteredEvents(filters);

  const hasActiveFilters = Object.values(params).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Farm Shows Directory"
        description="Discover farm shows, agricultural fairs, and farming events across Ontario."
      />

      <div className="mb-8">
        <EventFilters />
      </div>

      {/* Map Section */}
      {events.length > 0 && (
        <div className="mb-8">
          <MapWrapper events={events} className="h-[400px] rounded-xl border" />
        </div>
      )}

      {/* Results */}
      {events.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {events.length} event{events.length !== 1 ? "s" : ""}
              {hasActiveFilters ? " (filtered)" : ""}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <MapPin className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">No events found</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No events match your current filters. Try adjusting your search criteria or clearing filters."
              : "There are no upcoming events at this time. Check back soon for new listings."}
          </p>
        </div>
      )}
    </div>
  );
}
