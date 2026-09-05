"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

/** Parses h2/h3 headings out of rendered HTML content client-side and builds a TOC. */
export function TableOfContents({ contentSelector = "#post-content" }: { contentSelector?: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const nodes = Array.from(container.querySelectorAll("h2, h3"));
    const items: Heading[] = nodes.map((node, i) => {
      if (!node.id) node.id = `heading-${i}`;
      return { id: node.id, text: node.textContent || "", level: node.tagName === "H2" ? 2 : 3 };
    });
    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [contentSelector]);

  if (headings.length < 2) return null;

  return (
    <nav className="sticky top-24 hidden max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card p-5 lg:block">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Table of Contents
      </h4>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? "0.75rem" : 0 }}>
            <a
              href={`#${h.id}`}
              className={
                activeId === h.id
                  ? "font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
