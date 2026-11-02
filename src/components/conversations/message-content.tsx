import type { Message } from "@/lib/api";

function pageUrl(value?: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_")) url.searchParams.delete(key);
    }
    return url.href;
  } catch { return ""; }
}

function boldText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}

export function MessageContent({ message }: { message: Message }) {
  if (message.role !== "assistant") return <div>{message.content}</div>;
  const original = message.content.replace(/\\([*\[\]()])/g, "$1");
  const citedUrls = (original.match(/https?:\/\/[^\s<>\[\]()]+/g) || [])
    .map(value => pageUrl(value.replace(/[.,;!]+$/, ""))).filter(Boolean);
  const sourceUrls = (message.sources || []).map(source => pageUrl(source.url)).filter(Boolean);
  // Prefer a cited page from retrieved knowledge; otherwise use the top-ranked page.
  const url = sourceUrls.find(source => citedUrls.includes(source)) || sourceUrls[0] || "";
  const body = original
    .replace(/(?:^|\n|\s)(?:Sources?|References?):\s*[\s\S]*$/i, "")
    .replace(/\[([^\]]*)\]\(https?:\/\/[^\s)]+\)/g, (_, label: string) => /^https?:/.test(label) ? "" : label)
    .replace(/https?:\/\/[^\s<>]+/g, "")
    .replace(/(^|\s)\* (?=\*\*)/g, "\n\n")
    .replace(/^\s*[-*?]\s+/gm, "")
    .replace(/^\s*#{1,6}\s+(.+)$/gm, "**$1**")
    .trim();
  return <div className="answer-content">
    {body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) =>
      <p key={index}>{boldText(paragraph)}</p>)}
    {url && <a className="answer-page-link" href={url} target="_blank" rel="noopener noreferrer">{url}</a>}
  </div>;
}
