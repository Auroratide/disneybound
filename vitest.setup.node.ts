import { vi } from "vitest"

// Environment setup for Node-mode tests (API routes, data functions).
// These are local-only values — the PocketBase instance runs in Docker on this machine.
process.env.NEXT_PUBLIC_POCKETBASE_URL = "http://127.0.0.1:8090";
process.env.PB_SUPERUSER_EMAIL = "admin@disneybounding.com";
process.env.PB_SUPERUSER_PASSWORD = "password";

// next/cache functions require a Next.js server context that doesn't exist in tests.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
