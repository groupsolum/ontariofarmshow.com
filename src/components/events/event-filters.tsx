"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ONTARIO_REGIONS,
  EVENT_TYPES,
  VENUE_TYPES,
} from "@/lib/constants";

const FILTER_KEYS = ["region", "event_type", "venue_type", "is_free", "from", "to"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

interface EventFiltersProps {
  className?: string;
}

export function EventFilters({ className }: EventFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value) {
        filters[key] = value;
      }
    }
    return filters;
  }, [searchParams]);

  const activeFilterCount = useMemo(
    () => Object.keys(currentFilters).length,
    [currentFilters]
  );

  const updateFilter = useCallback(
    (key: FilterKey, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      // Reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

  const toggleFree = useCallback(() => {
    const isFreeActive = searchParams.get("is_free") === "true";
    updateFilter("is_free", isFreeActive ? null : "true");
  }, [searchParams, updateFilter]);

  const getFilterLabel = useCallback(
    (key: FilterKey, value: string): string => {
      switch (key) {
        case "region":
          return ONTARIO_REGIONS.find((r) => r.value === value)?.label ?? value;
        case "event_type":
          return EVENT_TYPES.find((t) => t.value === value)?.label ?? value;
        case "venue_type":
          return VENUE_TYPES.find((t) => t.value === value)?.label ?? value;
        case "is_free":
          return "Free Events";
        case "from":
          return `From: ${value}`;
        case "to":
          return `To: ${value}`;
        default:
          return value;
      }
    },
    []
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filter controls row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-x-visible sm:pb-0">
        <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </div>

        {/* Region */}
        <Select
          value={currentFilters.region ?? "all"}
          onValueChange={(value) => updateFilter("region", value)}
        >
          <SelectTrigger size="sm" className="w-auto min-w-[140px] shrink-0">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {ONTARIO_REGIONS.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Event Type */}
        <Select
          value={currentFilters.event_type ?? "all"}
          onValueChange={(value) => updateFilter("event_type", value)}
        >
          <SelectTrigger size="sm" className="w-auto min-w-[150px] shrink-0">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Venue Type */}
        <Select
          value={currentFilters.venue_type ?? "all"}
          onValueChange={(value) => updateFilter("venue_type", value)}
        >
          <SelectTrigger size="sm" className="w-auto min-w-[130px] shrink-0">
            <SelectValue placeholder="Venue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Venues</SelectItem>
            {VENUE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Free toggle */}
        <Button
          variant={currentFilters.is_free ? "default" : "outline"}
          size="sm"
          onClick={toggleFree}
          className="shrink-0"
        >
          Free
        </Button>

        {/* Date from */}
        <Input
          type="date"
          value={currentFilters.from ?? ""}
          onChange={(e) => updateFilter("from", e.target.value || null)}
          placeholder="From"
          className="h-8 w-auto min-w-[140px] shrink-0 text-sm"
          aria-label="Start date"
        />

        {/* Date to */}
        <Input
          type="date"
          value={currentFilters.to ?? ""}
          onChange={(e) => updateFilter("to", e.target.value || null)}
          placeholder="To"
          className="h-8 w-auto min-w-[140px] shrink-0 text-sm"
          aria-label="End date"
        />
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Active filters:
          </span>
          {Object.entries(currentFilters).map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="gap-1 pr-1 text-xs"
            >
              {getFilterLabel(key as FilterKey, value)}
              <button
                onClick={() => updateFilter(key as FilterKey, null)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${getFilterLabel(key as FilterKey, value)} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="xs"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
          {isPending && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Updating...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
