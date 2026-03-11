import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  Mail,
  Phone,
  User,
  ExternalLink,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { EventJsonLd } from "@/components/seo/event-json-ld";
import { EVENT_TYPES, VENUE_TYPES, EVENT_FEATURES } from "@/lib/constants";
import type { Event } from "@/types/event";

export const revalidate = 3600;

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data as Event;
}

export async function generateStaticParams() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("events")
      .select("slug")
      .eq("status", "published");

    return (data ?? []).map((event) => ({
      slug: event.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  const title = event.meta_title || event.title;
  const description =
    event.meta_description ||
    event.short_description ||
    `${event.title} - ${event.city}, Ontario. ${formatEventDates(event.start_date, event.end_date)}`;
  const ogImage = event.og_image_url || event.image_url || siteConfig.ogImage;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Ontario Farm Shows`,
      description,
      url: `${siteConfig.url}/farm-shows/${event.slug}`,
      images: [ogImage],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteConfig.url}/farm-shows/${event.slug}`,
    },
  };
}

function formatEventDates(startDate: string, endDate: string | null): string {
  const start = new Date(startDate + "T00:00:00");
  if (!endDate || endDate === startDate) {
    return format(start, "EEEE, MMMM d, yyyy");
  }
  const end = new Date(endDate + "T00:00:00");
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`;
  }
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

function formatTime(time: string | null): string | null {
  if (!time) return null;
  try {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return format(date, "h:mm a");
  } catch {
    return time;
  }
}

function buildGoogleMapsUrl(event: Event): string {
  const parts = [
    event.venue_name,
    event.address_line1,
    event.city,
    "Ontario",
    event.postal_code,
  ].filter(Boolean);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const eventTypeLabel =
    EVENT_TYPES.find((t) => t.value === event.event_type)?.label ??
    event.event_type;
  const venueTypeLabel =
    VENUE_TYPES.find((t) => t.value === event.venue_type)?.label ??
    event.venue_type;
  const googleMapsUrl = buildGoogleMapsUrl(event);
  const shareUrl = `${siteConfig.url}/farm-shows/${event.slug}`;

  return (
    <>
      <EventJsonLd event={event} />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Farm Shows", href: "/farm-shows" },
            { label: event.title },
          ]}
        />

        {/* Hero Section */}
        <div className="mb-8 mt-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{eventTypeLabel}</Badge>
            <Badge variant="outline">{venueTypeLabel}</Badge>
            {event.is_free && (
              <Badge className="bg-green-600 text-white">Free Event</Badge>
            )}
            {event.is_featured && (
              <Badge className="bg-primary text-white">Featured</Badge>
            )}
            {event.status === "cancelled" && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {event.title}
          </h1>

          {event.short_description && (
            <p className="text-lg text-muted-foreground">
              {event.short_description}
            </p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            {event.image_url && (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">About This Event</h2>
                <div className="prose prose-neutral max-w-none whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}

            {/* Features */}
            {event.features && event.features.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Features</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {event.features.map((feature) => {
                    const featureLabel =
                      EVENT_FEATURES.find((f) => f.value === feature)?.label ??
                      feature.replace(/_/g, " ");
                    return (
                      <div
                        key={feature}
                        className="flex items-center gap-2 rounded-md border p-3"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm capitalize">{featureLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Floor Plan */}
            {event.floor_plan_url && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Floor Plan</h2>
                <div className="relative overflow-hidden rounded-lg border">
                  <Image
                    src={event.floor_plan_url}
                    alt={`${event.title} floor plan`}
                    width={800}
                    height={600}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date & Time Card */}
            <div className="rounded-lg border p-5">
              <h3 className="mb-3 font-semibold">Date & Time</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{formatEventDates(event.start_date, event.end_date)}</span>
                </div>
                {(event.start_time || event.end_time) && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {formatTime(event.start_time)}
                      {event.end_time && ` - ${formatTime(event.end_time)}`}
                    </span>
                  </div>
                )}
                {event.recurring_pattern && (
                  <p className="text-xs text-muted-foreground">
                    {event.recurring_pattern}
                  </p>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="rounded-lg border p-5">
              <h3 className="mb-3 font-semibold">Location</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    {event.venue_name && (
                      <p className="font-medium">{event.venue_name}</p>
                    )}
                    {event.address_line1 && <p>{event.address_line1}</p>}
                    {event.address_line2 && <p>{event.address_line2}</p>}
                    <p>
                      {event.city}, {event.province}{" "}
                      {event.postal_code ?? ""}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Get Directions
              </a>
            </div>

            {/* Cost Card */}
            <div className="rounded-lg border p-5">
              <h3 className="mb-3 font-semibold">Admission</h3>
              <div className="flex items-start gap-3 text-sm">
                <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  {event.is_free ? (
                    <p className="font-medium text-green-600">Free Admission</p>
                  ) : (
                    <div className="space-y-1">
                      {event.adult_price != null && (
                        <p>Adults: ${event.adult_price.toFixed(2)}</p>
                      )}
                      {event.child_price != null && (
                        <p>Children: ${event.child_price.toFixed(2)}</p>
                      )}
                      {!event.adult_price && !event.child_price && (
                        <p>See website for pricing</p>
                      )}
                    </div>
                  )}
                  {event.price_notes && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.price_notes}
                    </p>
                  )}
                </div>
              </div>
              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block"
                >
                  <Button size="sm" className="w-full gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buy Tickets
                  </Button>
                </a>
              )}
            </div>

            {/* Organizer Card */}
            {(event.organizer_name ||
              event.organizer_email ||
              event.organizer_phone) && (
              <div className="rounded-lg border p-5">
                <h3 className="mb-3 font-semibold">Organizer</h3>
                <div className="space-y-2 text-sm">
                  {event.organizer_name && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 shrink-0 text-primary" />
                      <span>{event.organizer_name}</span>
                    </div>
                  )}
                  {event.organizer_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <a
                        href={`mailto:${event.organizer_email}`}
                        className="text-primary hover:underline"
                      >
                        {event.organizer_email}
                      </a>
                    </div>
                  )}
                  {event.organizer_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <a
                        href={`tel:${event.organizer_phone}`}
                        className="text-primary hover:underline"
                      >
                        {event.organizer_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Website Link */}
            {event.website_url && (
              <div className="rounded-lg border p-5">
                <h3 className="mb-3 font-semibold">Website</h3>
                <a
                  href={event.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Visit Official Website
                </a>
              </div>
            )}

            {/* Share Section */}
            <div className="rounded-lg border p-5">
              <h3 className="mb-3 font-semibold">Share This Event</h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    Facebook
                  </Button>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    Twitter
                  </Button>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Check out this farm show: ${shareUrl}`)}`}
                >
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Share2 className="h-3.5 w-3.5" />
                    Email
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Back Link */}
        <div className="text-center">
          <Link href="/farm-shows">
            <Button variant="outline">Back to All Farm Shows</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
