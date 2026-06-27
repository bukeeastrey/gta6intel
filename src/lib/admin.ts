// ════════════════════════════════════════════════════════════
// Admin auth — a simple shared-password gate for /admin.
// The admin UI sends the password in the `x-admin-password` header;
// every admin API route checks it against ADMIN_PASSWORD (server env).
// ════════════════════════════════════════════════════════════
export function isAdmin(req: Request): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false; // not configured → locked by default
  return req.headers.get('x-admin-password') === pw;
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}
