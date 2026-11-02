import type { Message } from "@/lib/api";

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function MessageContent({ message }: { message: Message }) {
  return (
    <>
      <div>
        {message.content.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) => {
          const url = part.replace(/[.,;:!?)\]]+$/, "");
          return safeUrl(url) ? (
            <span key={index}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              {part.slice(url.length)}
            </span>
          ) : (
            part
          );
        })}
      </div>
      {!!message.sources?.length && (
        <div className="citations" aria-label="Sources">
          Sources:{" "}
          {message.sources.map((source, index) => (
            <span key={index}>
              {index > 0 && " ? "}
              {source.url && safeUrl(source.url) ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
              ) : (
                source.title
              )}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
