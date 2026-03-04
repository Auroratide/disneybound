import { vi } from "vitest";

export const useRouter = vi.fn(() => ({ refresh: vi.fn() }));
export const usePathname = vi.fn(() => "/");
export const useSearchParams = vi.fn(() => new URLSearchParams());
