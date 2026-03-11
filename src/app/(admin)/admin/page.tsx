export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Eye,
  Star,
  ArrowRight,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Event } from "@/types/event";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch stats in parallel
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [
    { count: totalEvents },
    { count: publishedEvents },
    { count: totalSubscribers },
    { count: subscribersThisMonth },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("email_subscribers")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("email_subscribers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", firstOfMonth),
    supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Total Events",
      value: totalEvents ?? 0,
      icon: Calendar,
      href: "/admin/events",
    },
    {
      label: "Published",
      value: publishedEvents ?? 0,
      icon: Eye,
      href: "/admin/events",
    },
    {
      label: "Subscribers",
      value: totalSubscribers ?? 0,
      icon: Users,
      href: "/admin/subscribers",
    },
    {
      label: "New This Month",
      value: subscribersThisMonth ?? 0,
      icon: Star,
      href: "/admin/subscribers",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Ontario Farm Shows directory.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium">
                    {stat.label}
                  </CardDescription>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Last 5 events added to the directory</CardDescription>
            </div>
            <Link href="/admin/events">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentEvents && recentEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentEvents as Event[]).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell>{event.city}</TableCell>
                    <TableCell>
                      {format(new Date(event.start_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={event.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No events yet.{" "}
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
