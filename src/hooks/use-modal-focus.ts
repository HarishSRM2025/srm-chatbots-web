"use client";
import { useEffect, useRef } from "react";
export function useModalFocus(
  open: boolean,
  busy: boolean,
  onClose: () => void,
) {
  const close = useRef(onClose);
  close.current = onClose;
  const working = useRef(busy);
  working.current = busy;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]",
        ) || [],
      );
    if (!dialog?.contains(document.activeElement)) focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !working.current) close.current();
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [open]);
}
