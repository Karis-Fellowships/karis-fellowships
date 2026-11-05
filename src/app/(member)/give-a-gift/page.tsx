import { createServerClient } from "@/lib/supabase-server";
import { requireKF } from "@/lib/require-tier";
import GiveAGiftClient from "./GiveAGiftClient";

export default async function GiveAGiftPage() {
  await requireKF();
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <GiveAGiftClient
      userId={user?.id ?? ""}
      userEmail={user?.email ?? ""}
    />
  );
}
