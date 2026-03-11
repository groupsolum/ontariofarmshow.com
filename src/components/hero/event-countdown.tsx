"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CountdownEvent {
  title: string;
  slug: string;
  city: string;
  start_date: string;
  end_date: string | null;
  venue_name: string | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getEventStatus(event: CountdownEvent): "upcoming" | "in_progress" | "ended" {
  const now = new Date();
  const start = new Date(event.start_date + "T00:00:00");
  const end = event.end_date
    ? new Date(event.end_date + "T23:59:59")
    : new Date(event.start_date + "T23:59:59");

  if (now >= start && now <= end) return "in_progress";
  if (now < start) return "upcoming";
  return "ended";
}

function getTimeUntil(dateStr: string): TimeLeft {
  const now = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.max(0, target.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function EventCountdown({ event }: { event: CountdownEvent }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeUntil(event.start_date));
  const [status, setStatus] = useState(getEventStatus(event));

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getEventStatus(event));
      setTimeLeft(getTimeUntil(event.start_date));
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (status === "in_progress") {
    return (
      <div className="mt-8 inline-flex flex-col items-center gap-3 rounded-2xl border border-green-400/30 bg-green-500/20 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wider text-green-100">
            Happening Now
          </span>
        </div>
        <p className="text-lg font-bold text-white md:text-xl">{event.title}</p>
        <div className="flex items-center gap-1 text-sm text-green-100">
          <MapPin className="h-3.5 w-3.5" />
          <span>{event.venue_name ? `${event.venue_name}, ${event.city}` : event.city}</span>
        </div>
        <Link
          href={`/farm-shows/${event.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-white underline underline-offset-2 hover:text-green-100"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (status === "upcoming") {
    return (
      <div className="mt-8 inline-flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/80">
          <Clock className="h-3.5 w-3.5" />
          <span>Next Up: {event.title}</span>
        </div>
        <div className="flex gap-3 text-center">
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Min" },
            { value: timeLeft.seconds, label: "Sec" },
          ].map((unit) => (
            <div key={unit.label} className="min-w-[56px] rounded-lg bg-white/15 px-2.5 py-2 backdrop-blur-sm">
              <p className="text-2xl font-bold tabular-nums text-white md:text-3xl">
                {String(unit.value).padStart(2, "0")}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white/70">{unit.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm text-white/70">
          <MapPin className="h-3.5 w-3.5" />
          <span>{event.venue_name ? `${event.venue_name}, ${event.city}` : event.city}</span>
        </div>
        <Link
          href={`/farm-shows/${event.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-white underline underline-offset-2 hover:text-white/80"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return null;
}
