export interface EmailSubscriber {
  id: string;
  email: string;
  name: string | null;
  regions: string[] | null;
  event_types: string[] | null;
  frequency: "weekly" | "monthly" | "immediate";
  status: "pending" | "confirmed" | "unsubscribed";
  confirmation_token: string | null;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}
