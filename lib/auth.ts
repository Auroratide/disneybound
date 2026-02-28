import { cookies } from "next/headers";
import { getPocketbase } from "@/lib/pocketbase";

// Reads the PocketBase auth cookie set by the client-side singleton and returns
// the authenticated user (or null if not logged in). Use in server components
// and API routes to get the current user without a round-trip to PocketBase.
export async function getServerAuth() {
  const cookieStore = await cookies();
  const pb = getPocketbase();

  const raw = cookieStore.get("pb_auth")?.value;
  if (raw) {
    pb.authStore.loadFromCookie(`pb_auth=${raw}`);
  }

  return {
    pb,
    user: pb.authStore.isValid ? pb.authStore.record : null,
  };
}
