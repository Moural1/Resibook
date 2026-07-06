import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isResibookAdmin } from "@/lib/auth-role";
import { PixManualAdminClient } from "./pix-manual-admin-client";

export default async function PixManualAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isResibookAdmin(user)) redirect("/dashboard");
  return <PixManualAdminClient />;
}

