import "server-only";
import { headers } from "next/headers";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 15;

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

/** Простейший in-memory rate-limit по IP для login/register. */
export async function checkRateLimit(): Promise<void> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "local";
  const now = Date.now();
  const bucket = store.get(ip);
  if (!bucket || bucket.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    throw new Error(`Слишком много попыток. Повторите через ${retryAfterSec} с.`);
  }
}
