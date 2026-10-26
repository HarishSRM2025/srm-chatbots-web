import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
const origin = "http://localhost:18992";
const requests = [];
const backend = http.createServer(async (req, res) => {
  let body = "";
  for await (const part of req) body += part;
  requests.push({
    url: req.url,
    method: req.method,
    headers: req.headers,
    body,
  });
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/api/auth/login/")
    return res.end(
      JSON.stringify({ access: "test-access", refresh: "test-refresh" }),
    );
  if (req.url === "/api/auth/token/refresh/")
    return res.end(
      JSON.stringify({ access: "renewed-access", refresh: "renewed-refresh" }),
    );
  if (req.headers.authorization === "Bearer expired") {
    res.statusCode = 401;
    return res.end('{"detail":"expired"}');
  }
  if (req.url === "/api/knowledge/" && req.method === "POST") {
    res.statusCode = 201;
    return res.end('{"id":1,"status":"ready"}');
  }
  if (req.url?.startsWith("/api/chat/widget/")) return res.end('{"ok":true}');
  res.end("[]");
});
backend.listen(18991, "127.0.0.1");
await once(backend, "listening");
const app = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", "18992"],
  {
    env: { ...process.env, DJANGO_API_URL: "http://127.0.0.1:18991" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);
let output = "";
app.stdout.on("data", (d) => (output += d));
app.stderr.on("data", (d) => (output += d));
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready, output);
  assert.equal((await fetch(origin + "/widget/1")).status, 200);
  let response = await fetch(origin + "/api/backend/agents/");
  assert.equal(response.status, 401);
  response = await fetch(origin + "/api/backend/auth/login/", {
    method: "POST",
    headers: {
      Origin: "https://foreign.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(response.status, 403);
  response = await fetch(origin + "/api/backend/auth/login/", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: '{"username":"tester","password":"test"}',
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  const cookies = response.headers.getSetCookie();
  assert.ok(
    cookies.every((c) => c.includes("HttpOnly") && c.includes("SameSite=lax")),
  );
  const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
  response = await fetch(origin + "/api/backend/agents/", {
    headers: { Cookie: cookie },
  });
  assert.equal(response.status, 200);
  assert.equal(requests.at(-1).headers.authorization, "Bearer test-access");
  response = await fetch(origin + "/api/backend/agents/", {
    headers: { Cookie: "srm-access=expired; srm-refresh=test-refresh" },
  });
  assert.equal(response.status, 200);
  assert.equal(requests.at(-1).headers.authorization, "Bearer renewed-access");
  assert.ok(
    response.headers.getSetCookie().some((c) => c.includes("renewed-refresh")),
  );
  const form = new FormData();
  form.set("title", "Test source");
  form.set(
    "file",
    new Blob(["knowledge text"], { type: "text/plain" }),
    "test.txt",
  );
  response = await fetch(origin + "/api/backend/knowledge/", {
    method: "POST",
    headers: { Origin: origin, Cookie: cookie },
    body: form,
  });
  assert.equal(response.status, 201);
  assert.match(
    requests.at(-1).headers["content-type"],
    /multipart\/form-data; boundary=/,
  );
  assert.match(requests.at(-1).body, /knowledge text/);
  response = await fetch(
    origin + "/api/backend/chat/widget/conversations/1/messages/",
    {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "X-Widget-Session": "widget-token",
        "Idempotency-Key": "unique-key",
      },
      body: '{"agent_id":1,"content":"Hello"}',
    },
  );
  assert.equal(response.status, 200);
  assert.equal(requests.at(-1).headers.origin, origin);
  assert.equal(requests.at(-1).headers["x-widget-session"], "widget-token");
  assert.equal(requests.at(-1).headers["idempotency-key"], "unique-key");
  assert.equal(requests.at(-1).headers.authorization, undefined);
  response = await fetch(origin + "/api/backend/auth/logout/", {
    method: "POST",
    headers: { Origin: origin, Cookie: cookie },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.getSetCookie().length, 2);
  response = await fetch(origin + "/api/backend/admin/");
  assert.equal(response.status, 404);
  console.log(
    "PASS: pages, login/logout cookies, protected routes, origin checks, token refresh, multipart uploads, widget forwarding, namespace restrictions.",
  );
} finally {
  app.kill();
  backend.close();
}
