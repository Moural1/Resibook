import { getBillingRuntimeConfig } from "@/lib/billing/config";
import { AssinarClient } from "./assinar-client";

export default function AssinarPage() {
  const config = getBillingRuntimeConfig();
  return <AssinarClient testMode={config.testMode} />;
}
