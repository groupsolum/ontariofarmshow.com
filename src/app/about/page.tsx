import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Calendar, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ontario Farm Shows, the most comprehensive directory of farm shows, agricultural fairs, and farming events in Ontario, Canada.",
  openGraph: {
    title: "About | Ontario Farm Shows",
    description:
      "Learn about Ontario Farm Shows, the most comprehensive directory of farm shows and agricultural events in Ontario.",
    url: `${siteConfig.url}/about`,
    images: [siteConfig.ogImage],
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="About Ontario Farm Shows"
        description="Your comprehensive guide to farm shows and agricultural events across Ontario."
      />

      <div className="mx-auto max-w-3xl">
        {/* Mission */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Ontario Farm Shows is the province&apos;s most comprehensive directory
              of agricultural events. We connect farmers, industry professionals,
              families, and agriculture enthusiasts with farm shows, fairs,
              expos, and conferences happening across Ontario.
            </p>
            <p>
              Agriculture is the backbone of rural Ontario, and farm shows play a
              vital role in bringing communities together. Whether you&apos;re looking
              for the latest in farming equipment, livestock exhibitions, crop
              science demonstrations, or simply a great family day out, our
              directory helps you find the right event.
            </p>
            <p>
              We aim to be the single source of truth for anyone looking to
              attend or organize a farm show in Ontario. Our listings include
              detailed event information, interactive maps, pricing, venue
              details, and direct links to organizers.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">What We Offer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Interactive Map</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Browse events on a full-screen interactive map. See
                    what&apos;s happening near you at a glance.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Complete Listings</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Detailed event pages with dates, times, venues, pricing,
                    features, and organizer contact info.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Updates</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Subscribe to get notified about new events, date changes,
                    and special announcements.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Community Driven</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Built for Ontario&apos;s agricultural community. Event
                    organizers can submit and manage their listings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Regions */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Regions We Cover</h2>
          <p className="mb-4 text-muted-foreground">
            We list events from every corner of Ontario, including:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              "Eastern Ontario",
              "Western Ontario",
              "Central Ontario",
              "Northern Ontario",
              "Southern Ontario",
              "Greater Toronto Area",
              "Southwestern Ontario",
            ].map((region) => (
              <div
                key={region}
                className="rounded-md border px-3 py-2 text-center text-sm"
              >
                {region}
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Get in Touch</h2>
          <p className="mb-4 text-muted-foreground">
            Have questions, want to list your event, or need to update an
            existing listing? We would love to hear from you.
          </p>
          <p className="text-muted-foreground">
            Email us at{" "}
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="font-medium text-primary hover:underline"
            >
              {siteConfig.links.email}
            </a>
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-xl border bg-muted/50 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">
            Ready to Explore?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Browse our directory or view the interactive map to find your next
            farm show.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/farm-shows">
              <Button>Browse Farm Shows</Button>
            </Link>
            <Link href="/map">
              <Button variant="outline">View Map</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
