"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeSchema, type SubscribeFormData } from "@/validators/subscribe";
import { toast } from "sonner";

interface EmailSignupFormProps {
  source?: string;
  compact?: boolean;
}

export function EmailSignupForm({
  source = "website",
  compact = false,
}: EmailSignupFormProps) {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
  });

  async function onSubmit(data: SubscribeFormData) {
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to subscribe");
      }

      setSuccess(true);
      reset();
      toast.success("You're subscribed! Check your email for confirmation.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p>Thanks for subscribing! Check your email to confirm.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="max-w-[240px]"
        />
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email address"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <Input
          type="text"
          placeholder="Name (optional)"
          {...register("name")}
          className="sm:max-w-[180px]"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        Get Notified
      </Button>
    </form>
  );
}
