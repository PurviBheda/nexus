import type { ReactNode } from "react";
import type { IconName } from "../../types";

const iconPaths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  case: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4h8v2M3 11h18M10 14h4" /></>,
  file: <><path d="M4 3h11l5 5v13H4z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
  graph: <><circle cx="5" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="19" cy="18" r="2.5" /><path d="m7.2 10.8 8.5-3.7M7.4 13l9.2 4" /></>,
  spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
  chat: <><path d="M4 5h16v12H9l-5 4z" /><path d="M8 9h8M8 13h5" /></>,
  report: <><path d="M5 3h14v18H5z" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 8.7 7L6.4 6l-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A8 8 0 0 0 10.4 18l.3 2.6h4L15 18a8 8 0 0 0 1.7-1l2.3 1 2-3.4-2-1.6a7 7 0 0 0 0-1Z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.7-4.3 3.4-6.5 8-6.5s7.3 2.2 8 6.5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></>,
  bell: <><path d="M6 17h12l-1.5-2.5V10a4.5 4.5 0 0 0-9 0v4.5zM10 20h4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 15v5h16v-5" /></>,
  video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2z" /></>,
  audio: <><path d="M12 3v13a4 4 0 1 1-4-4h4M12 7l7-2v9" /><circle cx="17" cy="17" r="3" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m4 17 5-5 4 4 3-3 5 5" /></>,
  doc: <><path d="M5 3h10l4 4v14H5z" /><path d="M14 3v5h5M8 12h8M8 16h8" /></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
  play: <path d="m9 6 9 6-9 6z" />,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  download: <><path d="M12 3v13m0 0 5-5m-5 5-5-5M4 20h16" /></>,
  send: <><path d="m3 4 18 8-18 8 3-8zM6 12h15" /></>,
  expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></>,
  link: <><path d="M9 15 7 17a3.5 3.5 0 1 1-5-5l4-4a3.5 3.5 0 0 1 5 0" /><path d="m15 9 2-2a3.5 3.5 0 1 1 5 5l-4 4a3.5 3.5 0 0 1-5 0M8 12h8" /></>,
  alert: <><path d="M12 3 2 21h20z" /><path d="M12 9v5M12 17v.1" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
};

export default function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}
