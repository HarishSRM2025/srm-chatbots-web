import { test, expect } from "@playwright/test";

for (const widget of [false, true]) {
  test(`${widget ? "Widget" : "Playground"} supports suggested and independent questions with source links`, async ({ page }) => {
    const questions = ["How do I apply?"];
    const sent: string[] = [];
    const agent = { id: 1, name: "Admissions", status: "active", predefined_questions: questions };
    const conversation = { id: 1, agent: 1, agent_name: "Admissions", messages: [] };
    await page.route("**/api/backend/**", async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      let data: unknown = [];
      if (path.endsWith("/agents/")) data = [agent];
      else if (path.endsWith("/analytics/overview/")) data = { summary: {}, daily_activity: [], agent_usage: [] };
      else if (path.endsWith("/sessions/")) data = { session_token: "test", expires_at: "2099-01-01T00:00:00Z", predefined_questions: questions };
      else if (path.endsWith("/conversations/") && request.method() === "POST") data = conversation;
      else if (path.endsWith("/send/") || path.endsWith("/messages/")) {
        const content = request.postDataJSON().content;
        sent.push(content);
        data = {
          user_message: { id: sent.length * 2, role: "user", content },
          assistant_message: { id: sent.length * 2 + 1, role: "assistant", content: "See admissions.", sources: [{ title: "Admissions page", url: "https://example.edu/admissions" }] },
          sources: [],
        };
      }
      await route.fulfill({ json: data });
    });
    await page.goto(widget ? "/widget/1" : "/conversations?agent=1");
    if (widget) await page.getByRole("button", { name: "Start a conversation" }).click();
    await page.getByRole("button", { name: questions[0], exact: true }).click();
    await expect(page.getByRole("link", { name: "Admissions page" })).toHaveAttribute("href", "https://example.edu/admissions");
    await page.getByRole("textbox", { name: "Message", exact: true }).fill("What documents should I bring?");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("link", { name: "Admissions page" })).toHaveCount(2);
    expect(sent).toEqual([questions[0], "What documents should I bring?"]);
  });
}
