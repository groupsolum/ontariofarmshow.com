export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EVENT_TYPES } from "@/lib/constants";
import type { Event } from "@/types/event";

function StatusBadge({
  status,
}: {
  status: "draft" | "published" | "cancelled" | "archived";
}) {
  const variants: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function getEventTypeLabel(value: string): string {
  const found = EVENT_TYPES.find((t) => t.value === value);
  return found ? found.label : value;
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = format(new Date(startDate), "MMM d, yyyy");
  if (!endDate) return start;
  const end = format(new Date(endDate), "MMM d, yyyy");
  if (start === end) return start;
  return `${start} - ${end}`;
}

export default async function AdminEventsPage() {
  const supabase = createAdminClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load events: {error.message}
        </div>
      </div>
    );
  }

  const typedEvents = (events ?? []) as Event[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage all farm shows and agricultural events ({typedEvents.length}{" "}
            total)
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Including drafts, published, cancelled, and archived events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typedEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="max-w-[250px] font-medium">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="hover:underline"
                        >
                          {event.title}
                        </Link>
                        {event.is_featured && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs"
                          >
                            Featured
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{event.city}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateRange(event.start_date, event.end_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={event.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getEventTypeLabel(event.event_type)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Button variant="ghost" size="icon" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit?action=delete`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No events found.{" "}
              <Link
                href="/admin/events/new"
                className="text-primary hover:underline"
              >
                Create your first event
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
