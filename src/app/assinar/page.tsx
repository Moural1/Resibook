import { createClient } from "@/lib/supabase/server";
import { getBillingRuntimeConfig } from "@/lib/billing/config";
import {
  getManualPixConfig,
  type ManualPixOrder,
} from "@/lib/billing/manual-pix";
import { SUPPORT_PHONE_LINK } from "@/lib/support";
import { AssinarClient } from "./assinar-client";

export default async function AssinarPage() {
  const config = getBillingRuntimeConfig();
  const pixConfig = getManualPixConfig();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: manualPixOrder } = user ? await supabase
    .from("manual_pix_orders")
    .select("id, plan_id, status, amount, customer_email, customer_name, notes, created_at, approved_at, rejected_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle() : { data: null };

  return (
    <AssinarClient
      testMode={config.testMode}
      accountEmail={user?.email || ""}
      customerName={typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : ""}
      pixConfig={pixConfig}
      initialManualPixOrder={(manualPixOrder as ManualPixOrder | null) || null}
      supportPhone={SUPPORT_PHONE_LINK}
    />
  );
}
