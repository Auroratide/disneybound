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
    // Mirror auth state into a cookie on every change so server components
    // can read the token without accessing localStorage directly.
    clientInstance.authStore.onChange(() => {
      document.cookie = clientInstance!.authStore.exportToCookie({ sameSite: "Lax" });
    });
  }
  return clientInstance;
}
