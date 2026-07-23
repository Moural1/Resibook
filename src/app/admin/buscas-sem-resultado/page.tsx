import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isResibookAdmin } from "@/lib/auth-role";
import SearchNoResultsAdminClient from "./search-no-results-admin-client";

export const metadata = {
  title: "Buscas sem resultado | Resibook",
};

export default async function SearchNoResultsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isResibookAdmin(user)) {
    redirect("/dashboard");
  }

  return <SearchNoResultsAdminClient />;
}
