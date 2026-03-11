import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { subscribeSchema } from "@/validators/subscribe";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { siteConfig } from "@/lib/config";

function WelcomeEmail({ confirmUrl }: { confirmUrl: string }) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "560px",
        margin: "0 auto",
        padding: "40px 20px",
        color: "#1a1a1a",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        Welcome to Ontario Farm Shows
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#4a4a4a",
          marginBottom: "16px",
        }}
      >
        Thanks for subscribing! You will receive updates about farm shows,
        agricultural fairs, and farming events across Ontario.
      </p>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#4a4a4a",
          marginBottom: "24px",
        }}
      >
        Please confirm your email address by clicking the button below:
      </p>
      <a
        href={confirmUrl}
        style={{
          display: "inline-block",
          backgroundColor: "#16a34a",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        Confirm Email Address
      </a>
      <p
        style={{
          fontSize: "13px",
          lineHeight: "1.5",
          color: "#888",
          marginTop: "32px",
        }}
      >
        If you did not sign up for this list, you can safely ignore this email.
      </p>
    </div>
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, name, regions, source } = parsed.data;
    const confirmationToken = crypto.randomUUID();

    const supabase = createAdminClient();

    const { error: upsertError } = await supabase
      .from("email_subscribers")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          name: name ?? null,
          regions: regions ?? null,
          confirmation_token: confirmationToken,
          source: source ?? "website",
          status: "pending",
          frequency: "weekly",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    const confirmUrl = `${siteConfig.url}/api/subscribe/confirm?token=${confirmationToken}`;

    const { error: emailError } = await resend.emails.send({
      from: `Ontario Farm Shows <${siteConfig.links.email}>`,
      to: email,
      subject: "Welcome to Ontario Farm Shows - Confirm your email",
      react: WelcomeEmail({ confirmUrl }),
    });

    if (emailError) {
      console.error("Resend email error:", emailError);
      // Don't fail the subscription if the email fails; the record is already saved
    }

    return NextResponse.json(
      { message: "Subscription successful. Please check your email to confirm." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscribe route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
