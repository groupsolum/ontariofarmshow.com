import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/config";
import type { Event } from "@/types/event";

interface EventJsonLdProps {
  event: Event;
}

export function EventJsonLd({ event }: EventJsonLdProps) {
  const eventUrl = `${siteConfig.url}/farm-shows/${event.slug}`;

  const offers: Record<string, unknown> = event.is_free
    ? {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock",
        validFrom: event.created_at,
      }
    : event.adult_price
      ? {
          "@type": "Offer",
          price: String(event.adult_price),
          priceCurrency: "CAD",
          availability: "https://schema.org/InStock",
          validFrom: event.created_at,
          ...(event.ticket_url && { url: event.ticket_url }),
        }
      : {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          ...(event.ticket_url && { url: event.ticket_url }),
        };

  const location: Record<string, unknown> = {
    "@type": "Place",
    name: event.venue_name ?? event.city,
    address: {
      "@type": "PostalAddress",
      ...(event.address_line1 && { streetAddress: event.address_line1 }),
      addressLocality: event.city,
      addressRegion: event.province,
      ...(event.postal_code && { postalCode: event.postal_code }),
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: event.latitude,
      longitude: event.longitude,
    },
  };

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    name: event.title,
    ...(event.description && { description: event.description }),
    startDate: event.start_date,
    ...(event.end_date && { endDate: event.end_date }),
    eventStatus: event.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location,
    offers,
    ...(event.organizer_name && {
      organizer: {
        "@type": "Organization",
        name: event.organizer_name,
        ...(event.organizer_email && { email: event.organizer_email }),
        ...(event.website_url && { url: event.website_url }),
      },
    }),
    ...(event.image_url && {
      image: [event.image_url],
    }),
    url: eventUrl,
    ...(event.is_free && { isAccessibleForFree: true }),
  };

  return <JsonLd data={data} />;
}
