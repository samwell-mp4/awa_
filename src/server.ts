import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const isL5eAsset = url.pathname.startsWith("/__l5e/assets-v1/");

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);

      // If an asset wasn't found in the local static build, proxy from original store upstream
      if (isL5eAsset && response.status === 404) {
        try {
          const upstream = await fetch(`https://www.awa-tech.store${url.pathname}${url.search}`, {
            headers: {
              ...(request.headers.get("range") ? { range: request.headers.get("range")! } : {}),
              ...(request.headers.get("accept") ? { accept: request.headers.get("accept")! } : {}),
            },
          });
          if (upstream.ok || upstream.status === 206) {
            const h = new Headers(upstream.headers);
            h.set("cache-control", "public, max-age=31536000, immutable");
            h.set("access-control-allow-origin", "*");
            return new Response(upstream.body, {
              status: upstream.status,
              headers: h,
            });
          }
        } catch (upstreamErr) {
          console.warn("Upstream asset fetch fallback failed:", upstreamErr);
        }
      }

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
