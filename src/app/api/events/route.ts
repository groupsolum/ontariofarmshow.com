import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventSchema } from "@/validators/event";
import type { Event } from "@/types/event";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const venue = searchParams.get("venue");
    const free = searchParams.get("free");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const supabase = await createClient();

    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("start_date", { ascending: true });

    if (region) {
      query = query.eq("region", region);
    }

    if (type) {
      query = query.eq("event_type", type);
    }

    if (venue) {
      query = query.eq("venue_type", venue);
    }

    if (free === "true") {
      query = query.eq("is_free", true);
    }

    if (from) {
      query = query.gte("start_date", from);
    }

    if (to) {
      query = query.lte("start_date", to);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      events: (data as Event[]) ?? [],
      total: count ?? 0,
    });
  } catch (error) {
    console.error("Events GET error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify admin role
    const adminSupabase = createAdminClient();
    const { data: adminUser, error: adminError } = await adminSupabase
      .from("admin_users")
      .select("id, role, is_active")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Validate body
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const baseSlug = slugify(parsed.data.title);
    let slug = baseSlug;

    // Ensure slug uniqueness
    const { data: existingSlug } = await adminSupabase
      .from("events")
      .select("slug")
      .eq("slug", baseSlug)
      .single();

    if (existingSlug) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // Insert event
    const { data: event, error: insertError } = await adminSupabase
      .from("events")
      .insert({
        ...parsed.data,
        slug,
        province: "Ontario",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Event insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
