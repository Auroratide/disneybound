import PocketBase from "pocketbase";

const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;

if (!url) {
  throw new Error("NEXT_PUBLIC_POCKETBASE_URL is not set");
}

// On the server, create a new instance per module load (one per request in server components).
// On the client, reuse a single instance across navigations.
let clientInstance: PocketBase | undefined;

export function getPocketbase(): PocketBase {
  if (typeof window === "undefined") {
    // Server: always a fresh instance so auth state doesn't bleed between requests.
    return new PocketBase(url);
  }

  // Client: singleton
  if (!clientInstance) {
    clientInstance = new PocketBase(url);
  }
  return clientInstance;
}

// Returns a fresh PocketBase instance authenticated as the superuser.
// Use in API routes that need to write to collections whose rules are null.
// Never call this on the client — PB_SUPERUSER_* are server-only env vars.
export async function getAdminPocketbase(): Promise<PocketBase> {
  const pb = new PocketBase(url);
  await pb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!,
  );
  return pb;
}
