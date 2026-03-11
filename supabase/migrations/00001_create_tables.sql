-- Events table
CREATE TABLE public.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,
  short_description TEXT,

  -- Dates
  start_date      DATE NOT NULL,
  end_date        DATE,
  start_time      TIME,
  end_time        TIME,

  -- Location
  venue_name      TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  region          TEXT NOT NULL,
  province        TEXT NOT NULL DEFAULT 'Ontario',
  postal_code     TEXT,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,

  -- Classification
  event_type      TEXT NOT NULL DEFAULT 'farm_show',
  venue_type      TEXT NOT NULL DEFAULT 'mixed',

  -- Cost
  is_free         BOOLEAN NOT NULL DEFAULT false,
  adult_price     DECIMAL(8,2),
  child_price     DECIMAL(8,2),
  price_notes     TEXT,

  -- Media
  image_url       TEXT,
  thumbnail_url   TEXT,
  gallery_urls    TEXT[],
  floor_plan_url  TEXT,
  website_url     TEXT,
  ticket_url      TEXT,

  -- Contact
  organizer_name  TEXT,
  organizer_email TEXT,
  organizer_phone TEXT,

  -- Features
  features        TEXT[],

  -- SEO
  meta_title      TEXT,
  meta_description TEXT,
  og_image_url    TEXT,

  -- Status
  status          TEXT NOT NULL DEFAULT 'draft',
  is_featured     BOOLEAN NOT NULL DEFAULT false,

  -- Recurring
  recurring_pattern TEXT,
  parent_event_id UUID REFERENCES public.events(id),

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_region ON public.events(region);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_venue_type ON public.events(venue_type);
CREATE INDEX idx_events_is_free ON public.events(is_free);
CREATE INDEX idx_events_is_featured ON public.events(is_featured);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_published_date ON public.events(status, start_date)
  WHERE status = 'published';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Email subscribers table
CREATE TABLE public.email_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  regions         TEXT[],
  event_types     TEXT[],
  frequency       TEXT NOT NULL DEFAULT 'weekly',
  status          TEXT NOT NULL DEFAULT 'pending',
  confirmation_token TEXT UNIQUE,
  confirmed_at    TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  source          TEXT DEFAULT 'website',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscribers_email ON public.email_subscribers(email);
CREATE INDEX idx_subscribers_status ON public.email_subscribers(status);

CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON public.email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Admin users table
CREATE TABLE public.admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID NOT NULL UNIQUE,
  email           TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  role            TEXT NOT NULL DEFAULT 'editor',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SEO pages table
CREATE TABLE public.seo_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  heading         TEXT NOT NULL,
  description     TEXT,
  meta_title      TEXT,
  meta_description TEXT,
  content_html    TEXT,
  filter_config   JSONB,
  geo_center_lat  DOUBLE PRECISION,
  geo_center_lng  DOUBLE PRECISION,
  geo_radius_km   INTEGER,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can do everything with events"
  ON public.events FOR ALL
  USING (
    auth.uid() IN (SELECT auth_user_id FROM public.admin_users WHERE is_active = true)
  );

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON public.email_subscribers FOR SELECT
  USING (
    auth.uid() IN (SELECT auth_user_id FROM public.admin_users WHERE is_active = true)
  );

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (
    auth.uid() IN (SELECT auth_user_id FROM public.admin_users WHERE is_active = true)
  );

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active seo pages"
  ON public.seo_pages FOR SELECT
  USING (is_active = true);
