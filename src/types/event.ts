export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string;
  region: string;
  province: string;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  event_type: string;
  venue_type: string;
  is_free: boolean;
  adult_price: number | null;
  child_price: number | null;
  price_notes: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  gallery_urls: string[] | null;
  floor_plan_url: string | null;
  website_url: string | null;
  ticket_url: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  features: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  status: "draft" | "published" | "cancelled" | "archived";
  is_featured: boolean;
  recurring_pattern: string | null;
  parent_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  region?: string;
  event_type?: string;
  venue_type?: string;
  is_free?: boolean;
  from?: string;
  to?: string;
  featured?: boolean;
  q?: string;
}

export interface EventGeoJSON {
  type: "FeatureCollection";
  features: EventFeature[];
}

export interface EventFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    slug: string;
    title: string;
    city: string;
    start_date: string;
    end_date: string | null;
    venue_type: string;
    event_type: string;
    is_free: boolean;
    adult_price: number | null;
    thumbnail_url: string | null;
  };
}
