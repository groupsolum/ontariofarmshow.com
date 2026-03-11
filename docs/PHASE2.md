# Phase 2 — Future Features

This document outlines features planned for future implementation after the MVP launch.

---

## 1. User Accounts & Dashboards

### User Roles
- **Visitor**: General public browsing farm shows
- **Vendor**: Businesses selling at farm shows
- **Organizer**: Farm show event organizers
- **Admin**: Site administrators (already implemented in Phase 1)

### Database Schema

```sql
CREATE TABLE public.user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID NOT NULL UNIQUE,
  email           TEXT NOT NULL,
  display_name    TEXT,
  role            TEXT NOT NULL DEFAULT 'visitor',
  avatar_url      TEXT,
  phone           TEXT,
  company_name    TEXT,
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Auth Enhancements
- Social login: Google, Facebook via Supabase Auth providers
- Magic link (passwordless) login
- Email verification flow
- Profile completion wizard after signup

### Visitor Dashboard
- Saved/bookmarked events
- Notification preferences (email frequency, regions, event types)
- Event history / attended events
- Discount codes and annual pass management

---

## 2. Vendor Profiles

### Database Schema

```sql
CREATE TABLE public.vendor_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.user_profiles(id),
  business_name   TEXT NOT NULL,
  description     TEXT,
  website_url     TEXT,
  logo_url        TEXT,
  categories      TEXT[],
  contact_email   TEXT,
  contact_phone   TEXT,
  social_links    JSONB,
  is_verified     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.event_vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES public.events(id),
  vendor_id       UUID REFERENCES public.vendor_profiles(id),
  booth_number    TEXT,
  booth_location  JSONB,  -- {x, y, width, height} for SVG floor plan
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, vendor_id)
);
```

### Features
- Public vendor profile pages at `/vendors/[slug]`
- Vendor can list which shows they attend
- Contact info collection for Ontario Farm Show outreach
- Vendor directory with search and category filters

---

## 3. Interactive SVG Floor Plans

### Architecture
- Store floor plan SVG data in a `floor_plans` table with versioning
- Each vendor booth is a `<rect>` or `<path>` with `data-vendor-id` attribute
- Client component renders SVG with click handlers for vendor popups
- Use `react-zoom-pan-pinch` for mobile pinch-to-zoom

### Database Schema

```sql
CREATE TABLE public.floor_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES public.events(id),
  version         INTEGER NOT NULL DEFAULT 1,
  svg_data        TEXT NOT NULL,
  width           INTEGER,
  height          INTEGER,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Admin Tool
- Upload venue base map image
- Draw booth boundaries on top of the image
- Assign vendors to booths
- Export as SVG

---

## 4. SMS Notifications (Twilio)

### Implementation
- Add `phone` and `sms_opt_in` columns to subscribers or create `sms_subscribers` table
- Create `/api/sms/send` route handler
- Use Twilio SDK (`twilio` npm package)
- Implement rate limiting and consent tracking

### CASL Compliance (Canadian Anti-Spam Legislation)
- Explicit opt-in required
- Easy unsubscribe mechanism
- Consent records with timestamps
- Physical mailing address in messages

---

## 5. Annual Pass / Discount System

### Database Schema

```sql
CREATE TABLE public.passes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.user_profiles(id),
  pass_type       TEXT NOT NULL,  -- 'annual' | 'seasonal' | 'multi_event'
  valid_from      DATE NOT NULL,
  valid_until     DATE NOT NULL,
  price_paid      DECIMAL(8,2),
  stripe_payment_id TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.discount_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL,  -- 'percentage' | 'fixed'
  discount_value  DECIMAL(8,2) NOT NULL,
  event_id        UUID REFERENCES public.events(id),
  max_uses        INTEGER,
  current_uses    INTEGER DEFAULT 0,
  valid_from      DATE,
  valid_until     DATE,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Implementation
- Stripe integration for pass purchases
- QR code generation for pass verification at events
- Partner discount codes management
- Usage tracking and analytics

---

## 6. Partnership Management

### Database Schema

```sql
CREATE TABLE public.partnerships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name    TEXT NOT NULL,
  partner_type    TEXT,  -- 'sponsor' | 'media' | 'association' | 'government'
  logo_url        TEXT,
  website_url     TEXT,
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  display_order   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.event_partnerships (
  event_id        UUID REFERENCES public.events(id),
  partnership_id  UUID REFERENCES public.partnerships(id),
  sponsorship_level TEXT,  -- 'title' | 'gold' | 'silver' | 'bronze' | 'media'
  PRIMARY KEY (event_id, partnership_id)
);
```

### Features
- Partner logos on homepage and event pages
- Tiered sponsorship display
- Partner dashboard with analytics
- Co-branded landing pages

---

## 7. Recurring Event Auto-Creation

### Implementation
- Supabase Edge Function or Vercel Cron job running monthly
- Checks events with `recurring_pattern = 'annual'`
- Auto-creates next year's event instance in `draft` status
- Links to parent via `parent_event_id`
- Sets placeholder dates based on historical patterns
- Admin reviews and publishes when dates confirmed

### Cron Schedule
```
0 0 1 * *  # First of each month
```

---

## 8. Additional Future Considerations

### Analytics Dashboard
- Event page views and click-through rates
- Subscriber growth trends
- Geographic distribution of users
- Popular search filters

### Blog / Content Section
- Agricultural news and tips
- Farm show recaps and coverage
- Vendor spotlights
- SEO content for long-tail keywords

### Mobile App (PWA)
- Progressive Web App with offline support
- Push notifications
- Map with geolocation
- Ticketing / pass wallet integration

### Organizer Portal
- Self-service event listing and updates
- Vendor management tools
- Attendee analytics
- Floor plan builder
