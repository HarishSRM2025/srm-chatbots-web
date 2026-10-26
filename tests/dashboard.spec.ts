import { expect, test, type Page } from "@playwright/test";
const initialAgents = [
  {
    id: 1,
    name: "Admissions assistant",
    description:
      "Help prospective students find answers about admissions, eligibility, and the application process.",
    system_prompt: "Be helpful.",
    model_name: "qwen3:4b",
    status: "active",
    is_public: true,
    created_at: "2026-10-20T10:00:00Z",
  },
  {
    id: 2,
    name: "Campus companion",
    description:
      "A friendly guide to campus facilities, student services, and everyday university life.",
    system_prompt: "Be helpful.",
    model_name: "qwen3:4b",
    status: "active",
    is_public: false,
    created_at: "2026-10-20T10:00:00Z",
  },
  {
    id: 3,
    name: "Academic advisor",
    description:
      "Make course information and academic policies easier for students to navigate.",
    system_prompt: "Be helpful.",
    model_name: "qwen3:4b",
    status: "inactive",
    is_public: false,
    created_at: "2026-10-20T10:00:00Z",
  },
];
async function mockWorkspace(page: Page, signedIn = true) {
  let agents = structuredClone(initialAgents);
  let conversations = [
    {
      id: 1,
      agent: 1,
      agent_name: "Admissions assistant",
      title: "How can I apply for admission?",
      messages: [
        {
          id: 1,
          role: "user",
          content: "How can I apply for admission?",
          created_at: "2026-10-24T10:00:00Z",
        },
        {
          id: 2,
          role: "assistant",
          content: "You can start with the admissions guide.",
          created_at: "2026-10-24T10:00:01Z",
        },
      ],
      updated_at: "2026-10-24T10:00:00Z",
    },
  ];
  const sources = [
    {
      id: 1,
      agent: 1,
      agent_name: "Admissions assistant",
      title: "Admissions guide",
      source_type: "text",
      text_content: "Applications are open.",
      source_url: "",
      status: "ready",
      error_message: "",
    },
  ];
  await page.route("**/api/backend/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/backend/", "");
    const respond = (body: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    if (path === "auth/login/") {
      signedIn = true;
      return respond({ ok: true });
    }
    if (path === "auth/logout/") {
      signedIn = false;
      return respond({ ok: true });
    }
    if (!signedIn) return respond({ detail: "Please sign in." }, 401);
    if (path === "agents/" && request.method() === "POST") {
      const a = {
        ...request.postDataJSON(),
        id: 4,
        created_at: "2026-10-24T11:00:00Z",
      };
      agents.push(a);
      return respond(a, 201);
    }
    if (path === "agents/") return respond(agents);
    if (path === "knowledge/") return respond(sources);
    if (path === "analytics/overview/")
      return respond({
        summary: {
          total_agents: agents.length,
          active_agents: 2,
          total_conversations: 24,
          total_messages: 142,
          user_messages: 71,
          assistant_messages: 71,
        },
        daily_activity: [2, 5, 3, 7, 1, 4, 2].map((conversations, i) => ({
          date: `2026-10-${18 + i}`,
          conversations,
        })),
        agent_usage: agents.map((a) => ({
          ...a,
          conversation_count: 8,
          message_count: 42,
        })),
      });
    if (path === "chat/conversations/") {
      if (request.method() === "POST") {
        const data = request.postDataJSON();
        const c = {
          id: 2,
          agent: data.agent,
          agent_name: agents.find((a) => a.id === data.agent)!.name,
          title: data.title,
          messages: [],
          updated_at: "2026-10-24T11:00:00Z",
        };
        conversations.push(c);
        return respond(c, 201);
      }
      return respond(conversations);
    }
    if (/^chat\/conversations\/\d+\/send\/$/.test(path)) {
      const c = conversations.find((c) => c.id === Number(path.split("/")[2]))!;
      c.messages.push(
        {
          id: 3,
          role: "user",
          content: request.postDataJSON().content,
          created_at: "2026-10-24T12:00:00Z",
        },
        {
          id: 4,
          role: "assistant",
          content: "Here is an answer from your knowledge base.",
          created_at: "2026-10-24T12:00:01Z",
        },
      );
      return respond({
        user_message: c.messages[c.messages.length - 2],
        assistant_message: c.messages[c.messages.length - 1],
        sources: [{ title: "Admissions guide" }],
      });
    }
    if (/^chat\/conversations\/\d+\/$/.test(path))
      return respond(
        conversations.find((c) => c.id === Number(path.split("/")[2])),
      );
    return respond({ detail: "Unknown test endpoint" }, 404);
  });
}
test("dashboard routes, navigation history, and independent section content", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Workspace overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your launch checklist" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  for (const [name, path] of [
    ["Agents", "/agents"],
    ["Knowledge", "/knowledge"],
    ["Analytics", "/analytics"],
    ["Integrations", "/integrations"],
    ["Conversations", "/conversations"],
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: new RegExp(name) })
      .click();
    await expect(page).toHaveURL(new RegExp(path + "$"));
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation")
        .getByRole("link", { name: new RegExp(name) }),
    ).toHaveAttribute("aria-current", "page");
  }
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Integrations", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Integrations", exact: true }),
  ).toBeVisible();
});
test("agent search, status filters, and create dialog retain behavior", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.goto("/agents");
  await expect(
    page.getByRole("heading", { name: "Admissions assistant" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Inactive/ }).click();
  await expect(
    page.getByRole("heading", { name: "Academic advisor" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Admissions assistant" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /^All agents/ }).click();
  await page.getByLabel("Search agents").fill("no result");
  await expect(
    page.getByRole("heading", { name: "No agents found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .getByRole("button", { name: "Create agent", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Agent name").fill("Library assistant");
  await page.getByRole("button", { name: "Save agent" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Library assistant" }),
  ).toBeVisible();
});
test("knowledge management and direct conversation links", async ({ page }) => {
  await mockWorkspace(page);
  await page.goto("/knowledge");
  await expect(
    page.getByRole("cell", { name: "Admissions guide", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Admissions guide" }).click();
  await expect(page.getByLabel("Knowledge text")).toHaveValue(
    "Applications are open.",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/conversations?conversation=1");
  await expect(
    page.getByText("You can start with the admissions guide.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Message", { exact: true }).fill("Tell me more");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByText("Here is an answer from your knowledge base."),
  ).toBeVisible();
  await expect(page.getByText("Sources: Admissions guide")).toBeVisible();
});
test("mobile navigation and page layout fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockWorkspace(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Workspace overview" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation")).not.toBeInViewport();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Knowledge" })
    .click();
  await expect(page).toHaveURL(/\/knowledge$/);
  await expect(page.getByRole("navigation")).not.toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/\/login/);
});
test("login preserves a requested page", async ({ page }) => {
  await mockWorkspace(page, false);
  await page.goto("/analytics");
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel("Username").fill("tester");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/analytics$/);
  await expect(
    page.getByRole("heading", { name: "Analytics", exact: true }),
  ).toBeVisible();
});

test("sending clears the composer and shows the message before inference completes", async ({
  page,
}) => {
  await mockWorkspace(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    "**/api/backend/chat/conversations/1/send/",
    async (route) => {
      await gate;
      await route.fallback();
    },
  );
  await page.goto("/conversations?conversation=1");
  await expect(
    page.getByText("You can start with the admissions guide.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Message", { exact: true })
    .fill("What is the latest event?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("");
  await expect(
    page
      .locator(".message.user")
      .filter({ hasText: "What is the latest event?" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("status", { name: "Assistant is preparing a response" }),
  ).toBeVisible();
  await page.getByLabel("Message", { exact: true }).fill("My next question");
  release();
  await expect(
    page.getByText("Here is an answer from your knowledge base."),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Assistant is preparing a response" }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".message.user")
      .filter({ hasText: "What is the latest event?" }),
  ).toHaveCount(1);
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
    "My next question",
  );
});

test("failed send restores unsaved text without leaving a phantom message", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.route("**/api/backend/chat/conversations/1/send/", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ detail: "The local AI service is unavailable." }),
    }),
  );
  await page.goto("/conversations?conversation=1");
  await expect(
    page.getByText("You can start with the admissions guide.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Message", { exact: true }).fill("A question to retry");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".alert.error")).toContainText(
    "The local AI service is unavailable.",
  );
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
    "A question to retry",
  );
  await expect(
    page.locator(".message.user").filter({ hasText: "A question to retry" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("status", { name: "Assistant is preparing a response" }),
  ).toHaveCount(0);
});

test("an inference failure reconciles a saved user message without duplication", async ({
  page,
}) => {
  await mockWorkspace(page);
  let saved = false;
  await page.route("**/api/backend/chat/conversations/1/", async (route) => {
    if (!saved) return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        agent: 1,
        agent_name: "Admissions assistant",
        title: "Chat",
        updated_at: "2026-10-24T12:00:00Z",
        messages: [
          {
            id: 3,
            role: "user",
            content: "Saved question",
            created_at: "2026-10-24T12:00:00Z",
          },
        ],
      }),
    });
  });
  await page.route(
    "**/api/backend/chat/conversations/1/send/",
    async (route) => {
      saved = true;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "The local AI service is unavailable.",
        }),
      });
    },
  );
  await page.goto("/conversations?conversation=1");
  await expect(
    page.getByText("You can start with the admissions guide.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Message", { exact: true }).fill("Saved question");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".alert.error")).toContainText(
    "The local AI service is unavailable.",
  );
  await expect(
    page.locator(".message.user").filter({ hasText: "Saved question" }),
  ).toHaveCount(1);
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("");
  await expect(
    page.getByRole("status", { name: "Assistant is preparing a response" }),
  ).toHaveCount(0);
});
