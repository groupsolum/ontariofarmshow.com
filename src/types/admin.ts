export interface AdminUser {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string | null;
  role: "super_admin" | "admin" | "editor";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
