"use client";

import { useState } from "react";

type ExpandableTextProps = {
  text: string;
  maxLength?: number;
  className?: string;
  quote?: boolean;
};

export default function ExpandableText({
  text,
  maxLength = 160,
  className,
  quote = false,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > maxLength;
  const shown =
    expanded || !isLong ? text : `${text.slice(0, maxLength).trimEnd()}…`;
  const content = quote ? `“${shown}”` : shown;

  return (
    <p className={className}>
      {content}
      {isLong && (
        <button
          type="button"
          className="expandable-text-toggle"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </p>
  );
}
