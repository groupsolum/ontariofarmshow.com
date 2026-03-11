import Link from "next/link";
import { Calendar, MapPin, DollarSign, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { EVENT_TYPES, VENUE_TYPES } from "@/lib/constants";

function formatEventDates(startDate: string, endDate: string | null) {
  const start = new Date(startDate + "T00:00:00");
  if (!endDate || endDate === startDate) {
    return format(start, "MMMM d, yyyy");
  }
  const end = new Date(endDate + "T00:00:00");
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`;
  }
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

function formatPrice(event: Event) {
  if (event.is_free) return "Free";
  if (event.adult_price) return `$${event.adult_price}`;
  return "See website";
}

export function EventCard({ event }: { event: Event }) {
  const eventTypeLabel =
    EVENT_TYPES.find((t) => t.value === event.event_type)?.label ||
    event.event_type;
  const venueTypeLabel =
    VENUE_TYPES.find((t) => t.value === event.venue_type)?.label ||
    event.venue_type;

  return (
    <Link href={`/farm-shows/${event.slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {eventTypeLabel}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {venueTypeLabel}
              </Badge>
            </div>
            {event.is_featured && (
              <Badge className="shrink-0 bg-primary text-xs">Featured</Badge>
            )}
          </div>

          <h3 className="mb-2 text-lg font-semibold leading-tight group-hover:text-primary">
            {event.title}
          </h3>

          {event.short_description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {event.short_description}
            </p>
          )}

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              <span>{formatEventDates(event.start_date, event.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>
                {event.venue_name ? `${event.venue_name}, ` : ""}
                {event.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 shrink-0 text-primary" />
              <span>{formatPrice(event)}</span>
              {event.price_notes && (
                <span className="truncate text-xs text-muted-foreground/70">
                  - {event.price_notes}
                </span>
              )}
            </div>
            {event.features && event.features.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-wrap gap-1">
                  {event.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="rounded bg-muted px-1.5 py-0.5 text-xs"
                    >
                      {f.replace("_", " ")}
                    </span>
                  ))}
                  {event.features.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{event.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
