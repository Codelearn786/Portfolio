/*
  Cloudflare Worker skeleton for relay health and allowlisted metadata calls.
  Do not hardcode secrets. Keep strict personal-use scope.
*/

export interface Env {
  ALLOW_ORIGIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': env.ALLOW_ORIGIN || '*'
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
