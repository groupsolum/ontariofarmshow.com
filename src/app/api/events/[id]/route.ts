import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventSchema } from "@/validators/event";
import type { Event } from "@/types/event";

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false as const, error: "Authentication required", status: 401 };
  }

  const adminSupabase = createAdminClient();
  const { data: adminUser, error: adminError } = await adminSupabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .single();

  if (adminError || !adminUser) {
    return { authorized: false as const, error: "Insufficient permissions", status: 403 };
  }

  return { authorized: true as const, adminUser, adminSupabase };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: event as Event });
  } catch (error) {
    console.error("Event GET error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminCheck = await verifyAdmin(supabase);

    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const parsed = eventSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { adminSupabase } = adminCheck;

    const { data: event, error: updateError } = await adminSupabase
      .from("events")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Event update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    revalidatePath("/farm-shows");
    revalidatePath(`/farm-shows/${event.slug}`);

    return NextResponse.json({ event: event as Event });
  } catch (error) {
    console.error("Event PUT error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminCheck = await verifyAdmin(supabase);

    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { adminSupabase } = adminCheck;

    // Soft delete: set status to archived
    const { data: event, error: archiveError } = await adminSupabase
      .from("events")
      .update({
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("slug")
      .single();

    if (archiveError) {
      console.error("Event archive error:", archiveError);
      return NextResponse.json(
        { error: "Failed to archive event" },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    revalidatePath("/farm-shows");
    revalidatePath(`/farm-shows/${event.slug}`);

    return NextResponse.json({ message: "Event archived successfully" });
  } catch (error) {
    console.error("Event DELETE error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
