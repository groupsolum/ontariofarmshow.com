import { Metadata } from "next";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmailSignupForm } from "@/components/subscribe/email-signup-form";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Stay updated on farm shows and agricultural events across Ontario. Get email notifications about new events, special deals, and more.",
  openGraph: {
    title: "Subscribe | Ontario Farm Shows",
    description:
      "Stay updated on farm shows and agricultural events across Ontario.",
    url: `${siteConfig.url}/subscribe`,
    images: [siteConfig.ogImage],
  },
};

export default function SubscribePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Stay Updated"
        description="Subscribe to receive the latest farm show announcements, event updates, and agricultural news across Ontario."
      />

      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Email Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Free, no spam, unsubscribe anytime
              </p>
            </div>
          </div>

          <EmailSignupForm source="subscribe-page" />

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>When you subscribe, you will receive:</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>New farm show and agricultural event announcements</li>
              <li>Date changes, cancellations, and important updates</li>
              <li>Early bird ticket deals and discount codes</li>
              <li>Seasonal event roundups for your region</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
