import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

/** Server-rendered pagination. Keeps other query params (like ?q=) intact. */
export default function Pagination({
  page,
  pages,
  basePath,
  params = {},
}: {
  page: number;
  pages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // show first, last and a window around the current page
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1
  );

  const cell = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold";

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={clsx(cell, "hover:bg-mist")} aria-label="Previous page" rel="prev">
          <ChevronLeft size={18} />
        </Link>
      )}
      {nums.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - nums[i - 1] > 1 && <span aria-hidden>…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={clsx(cell, p === page ? "bg-ink text-white" : "hover:bg-mist")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={clsx(cell, "hover:bg-mist")} aria-label="Next page" rel="next">
          <ChevronRight size={18} />
        </Link>
      )}
    </nav>
  );
}
