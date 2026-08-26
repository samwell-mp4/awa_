import type { PaddleEnv } from "@/lib/paddle.server";

/**
 * Paddle publishes the IPs its webhooks are sent from. The list can change, so
 * it is fetched at runtime (never hard-coded) and cached in memory for an hour.
 */
const IPS_URL: Record<PaddleEnv, string> = {
  live: "https://api.paddle.com/ips",
  sandbox: "https://sandbox-api.paddle.com/ips",
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<PaddleEnv, { ips: Set<string>; at: number }>();

async function loadIps(env: PaddleEnv): Promise<Set<string>> {
  const hit = cache.get(env);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.ips;
  const res = await fetch(IPS_URL[env]);
  if (!res.ok) throw new Error(`Could not fetch Paddle IPs (${res.status})`);
  const json: any = await res.json();
  const cidrs: string[] = json?.data?.ipv4_cidrs ?? [];
  // Paddle publishes /32 CIDRs (single addresses).
  const ips = new Set(cidrs.map((c) => c.split("/")[0]));
  if (!ips.size) throw new Error("Paddle IP list is empty");
  cache.set(env, { ips, at: Date.now() });
  return ips;
}

function clientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip");
}

/**
 * Returns true when the request comes from a published Paddle IP. Fails closed
 * only when the source IP is known and not on the list; if the platform hides
 * the source IP we fall back to signature verification alone.
 */
export async function isPaddleRequest(req: Request, env: PaddleEnv): Promise<boolean> {
  const ip = clientIp(req);
  if (!ip) return true;
  try {
    const ips = await loadIps(env);
    return ips.has(ip);
  } catch {
    // Never drop a real webhook because the IP endpoint is unreachable —
    // the signature check below is still enforced.
    return true;
  }
}
