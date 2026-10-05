import type { ReactNode } from "react";
import type { EvidenceTone } from "../../types";

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: EvidenceTone;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
