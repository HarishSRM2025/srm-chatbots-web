# SRM Chatbots frontend

A Next.js App Router + TypeScript frontend for the adjacent Django API.

## Run locally

Requirements: Node.js 20.9+ (Node 22 recommended), the configured Django API, its database, and Ollama for AI responses.

```powershell
cd C:\Users\user\Desktop\SRM-Chatbots\srm-chatbots-web
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. In another terminal, start the existing backend:

```powershell
cd C:\Users\user\Desktop\SRM-Chatbots\srm-chatbots-api
.\.venv\Scripts\python.exe manage.py runserver
```

The backend must already have its environment, database migrations, and Ollama model configured. Set `DJANGO_API_URL` in `.env.local` if Django runs elsewhere; use its origin without `/api`. Restart Next.js after changing environment values. Register an account from the sign-in page or use an existing Django username and password.

## Features

- Registration, login, logout, HTTP-only JWT cookies, automatic access-token refresh.
- Overview with real workspace counts and agent cards.
- Create, edit, delete, activate/deactivate, and configure agents and public access.
- Text, URL, PDF, TXT, DOCX, and Markdown knowledge sources; edit, delete, and retry processing. Upload limit: 10 MB.
- Chat playground with active-agent selection, conversation history, persisted messages, and response source references.
- Seven-day conversation chart and per-agent usage from the analytics endpoint.
- Public chat widget at `/widget/<agent-id>` with temporary sessions, history restoration, and idempotent message retries.
- Responsive layouts, empty states, API error feedback, and destructive-action confirmation.

## Pages and component structure

Each dashboard section has its own Next.js route and feature component. The former single `src/app/page.tsx` has been replaced by the `(dashboard)` route group; parentheses organize the source without appearing in URLs.

| URL              | Page component                                       |
| ---------------- | ---------------------------------------------------- |
| `/`              | `components/overview/overview-section.tsx`           |
| `/agents`        | `components/agents/agents-section.tsx`               |
| `/knowledge`     | `components/knowledge/knowledge-section.tsx`         |
| `/conversations` | `components/conversations/conversations-section.tsx` |
| `/analytics`     | `components/analytics/analytics-section.tsx`         |
| `/integrations`  | `components/integrations/integrations-section.tsx`   |
| `/login`         | `components/auth/auth-screen.tsx`                    |

```text
src/
  app/
    (dashboard)/           # Small route files and the shared dashboard layout
    login/                 # Standalone sign-in and registration page
    widget/[agentId]/      # Public widget, independent of the dashboard
    api/backend/[...path]/ # Existing Django proxy
    globals.css            # Shared controls, dialogs, authentication, and chat
  components/
    dashboard/             # Sidebar, topbar, navigation, heading, and shell
    overview/              # Metrics, welcome banner, recent chats, checklist
    agents/                # Agent cards, filters, and editing dialog
    knowledge/             # Source library, source table, and editing dialog
    conversations/         # Chat playground and conversation history
    analytics/             # Activity chart and agent usage table
    integrations/          # Widget embed setup
    auth/                  # Login and registration form
    ui/                    # Feedback, empty states, and metric cards
  hooks/                   # Conversation behavior and dialog focus management
  providers/               # Shared workspace data, API actions, and session state
  styles/dashboard.css    # Dashboard-specific design and responsive layout
```

Navigation uses Next.js links and supports browser Back/Forward and direct page reloads. Conversations can be opened with `?conversation=<id>` or started with `?agent=<id>`. Sign-in preserves the requested dashboard URL. Workspace state is shared by the persistent layout; page filters and chat drafts stay within their feature components.

## Public widgets

Set an agent to active and public. In Django admin, set its `allowed_origins` to the **frontend origin**, e.g. `["http://localhost:3000"]`. This field exists on the backend model but is not exposed by the current agent serializer. The widget runs inside a frontend iframe and the proxy forwards that frontend origin to Django; the parent website origin is not available to the backend through this iframe integration. Use backend origin permissions accordingly; this does not restrict which sites can embed the iframe.

Copy the iframe snippet from Integrations. For live websites, run the frontend on a reachable HTTPS URL, configure that origin in Django, and copy the snippet there. Browser restrictions on third-party storage can prevent history restoration; chatting still works in memory. Widget session and message throttles are enforced by Django. After expiration, start a new chat.

## API integration

`src/app/api/backend/[...path]/route.ts` proxies the supported API namespaces to Django. It stores JWTs in HTTP-only SameSite cookies, checks the origin on mutations, forwards multipart uploads and widget security headers, and keeps API responses uncached. JWTs are never returned to browser JavaScript. Production cookies require HTTPS. Host the frontend on a trusted origin and configure a reverse proxy to preserve the request origin/host.

The frontend deliberately follows existing backend capabilities: conversations cannot be renamed or deleted, analytics excludes widget traffic, and password reset/account editing are not implemented by the API. The authenticated send endpoint saves a user message before inference, so a failed send can remain in history; manually sending again creates another message. Source references are returned for new replies but are not persisted in the conversation-history response.

## Verification

```powershell
npm run build
npm run typecheck
node scripts/smoke-test.mjs
npm run test:e2e
```

The smoke test starts an isolated mock Django API and the built Next.js server on ports 18991 and 18992. It verifies page responses, authentication, token refresh, CSRF origin rejection, multipart forwarding, and widget headers. It does not connect to the real database or run Ollama.

The Playwright tests use installed Google Chrome and start the production build on port 18993. They mock API responses and verify routes, navigation history, login redirects, filters, creation dialogs, knowledge editing, chat replies, and a 390px mobile layout. Run `npm run build` first. Browser screenshots and failure traces are written to the ignored `test-results/` directory. These checks do not verify live Django or Ollama services.

For production, use `npm run build` then `npm start`, with `DJANGO_API_URL` configured in the server environment.

Implementation reference: [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route).
