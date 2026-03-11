import Link from "next/link";
import {
  MapPin,
  Calendar,
  Search,
  ArrowRight,
  Bell,
  Tractor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/events/event-card";
import { EmailSignupForm } from "@/components/subscribe/email-signup-form";
import { HeroVideo } from "@/components/hero/hero-video";
import { EventCountdown } from "@/components/hero/event-countdown";
import { createAdminClient } from "@/lib/supabase/admin";
import { Event } from "@/types/event";

export const revalidate = 3600;

async function getFeaturedEvents(): Promise<Event[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("is_featured", true)
    .order("start_date", { ascending: true })
    .limit(6);
  return (data as Event[]) || [];
}

async function getEventCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return count || 0;
}

async function getNextOrCurrentEvent(): Promise<Event | null> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // First check for events happening right now (started but not ended)
  const { data: inProgress } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_date", { ascending: true })
    .limit(1);

  if (inProgress && inProgress.length > 0) return inProgress[0] as Event;

  // Otherwise get the next upcoming event
  const { data: upcoming } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gt("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1);

  if (upcoming && upcoming.length > 0) return upcoming[0] as Event;

  return null;
}

export default async function HomePage() {
  const [featuredEvents, eventCount, nextEvent] = await Promise.all([
    getFeaturedEvents(),
    getEventCount(),
    getNextOrCurrentEvent(),
  ]);

  return (
    <>
      {/* Hero Section with Video Backdrop */}
      <section className="relative min-h-[600px] overflow-hidden bg-black pb-16 pt-20 md:min-h-[700px] md:pb-24 md:pt-28">
        <HeroVideo />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Tractor className="h-4 w-4" />
              <span>Your Guide to Ontario&apos;s Agricultural Events</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Discover{" "}
              <span className="text-green-400">Farm Shows</span> Across
              Ontario
            </h1>
            <p className="mb-8 text-lg text-white/80 md:text-xl">
              Find every farm show, agricultural fair, and farming event in
              Ontario. Browse {eventCount}+ events with interactive maps, dates,
              locations, and ticket information.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/farm-shows">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Browse Farm Shows
                </Button>
              </Link>
              <Link href="/map">
                <Button size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <MapPin className="h-4 w-4" />
                  View Map
                </Button>
              </Link>
            </div>
            {nextEvent && (
              <EventCountdown
                event={{
                  title: nextEvent.title,
                  slug: nextEvent.slug,
                  city: nextEvent.city,
                  start_date: nextEvent.start_date,
                  end_date: nextEvent.end_date,
                  venue_name: nextEvent.venue_name,
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary md:text-3xl">
                {eventCount}+
              </p>
              <p className="text-sm text-muted-foreground">Farm Shows</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary md:text-3xl">
                20+
              </p>
              <p className="text-sm text-muted-foreground">Cities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary md:text-3xl">
                Year-Round
              </p>
              <p className="text-sm text-muted-foreground">Events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  Featured Farm Shows
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Don&apos;t miss these popular agricultural events
                </p>
              </div>
              <Link
                href="/farm-shows"
                className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link href="/farm-shows">
                <Button variant="outline" className="gap-2">
                  View All Farm Shows
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Feature Cards */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
            Everything You Need
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Interactive Map</h3>
                <p className="text-sm text-muted-foreground">
                  See all farm shows pinned on an interactive map. Filter by
                  region, type, and more.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Complete Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Browse events by date, find what&apos;s happening this weekend,
                  and never miss a farm show.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Stay Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribe to get notified about new events, discounts, and
                  exclusive announcements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Email Signup CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm md:p-12">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Stay in the Loop</h2>
            <p className="mb-6 text-muted-foreground">
              Get notified about new farm shows, special discounts, and
              agricultural events across Ontario.
            </p>
            <div className="mx-auto max-w-md">
              <EmailSignupForm source="homepage" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
