import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isResibookAdmin } from "@/lib/auth-role";
import { AclsEbookAdminClient } from "./acls-ebook-admin-client";

export const metadata = {
  title: "Editor do eBook ACLS | Resibook",
};

export default async function AclsEbookAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isResibookAdmin(user)) redirect("/dashboard");
  return <AclsEbookAdminClient />;
}
