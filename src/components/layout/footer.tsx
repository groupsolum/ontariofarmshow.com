import Link from "next/link";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Ontario Farm Shows</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Your complete directory of farm shows and agricultural events
              across Ontario, Canada.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/farm-shows" className="hover:text-foreground">
                  All Farm Shows
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-foreground">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/farm-shows/free" className="hover:text-foreground">
                  Free Events
                </Link>
              </li>
              <li>
                <Link
                  href="/farm-shows/near-toronto"
                  className="hover:text-foreground"
                >
                  Near Toronto
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="hover:text-foreground">
                  Get Notified
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Browse by Type */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Browse by Type</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/farm-shows/indoor"
                  className="hover:text-foreground"
                >
                  Indoor Farm Shows
                </Link>
              </li>
              <li>
                <Link
                  href="/farm-shows/outdoor"
                  className="hover:text-foreground"
                >
                  Outdoor Farm Shows
                </Link>
              </li>
              <li>
                <Link
                  href="/farm-shows/near-ottawa"
                  className="hover:text-foreground"
                >
                  Near Ottawa
                </Link>
              </li>
              <li>
                <Link
                  href="/farm-shows/near-london"
                  className="hover:text-foreground"
                >
                  Near London
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ontario Farm Shows. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
