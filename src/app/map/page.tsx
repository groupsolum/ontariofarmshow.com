import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";
import type { Event } from "@/types/event";
import { MapWrapper } from "@/components/map/map-wrapper";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Farm Show Map",
  description:
    "View all Ontario farm shows and agricultural events on an interactive map. Find events near you with our map-based directory.",
  openGraph: {
    title: "Farm Show Map | Ontario Farm Shows",
    description:
      "View all Ontario farm shows and agricultural events on an interactive map.",
    url: `${siteConfig.url}/map`,
    images: [siteConfig.ogImage],
  },
};

async function getAllPublishedEvents(): Promise<Event[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch events for map:", error);
    return [];
  }

  return (data as Event[]) ?? [];
}

export default async function MapPage() {
  const events = await getAllPublishedEvents();

  return (
    <div className="h-[calc(100vh-4rem)]">
      <MapWrapper events={events} className="h-full" />
    </div>
  );
}
