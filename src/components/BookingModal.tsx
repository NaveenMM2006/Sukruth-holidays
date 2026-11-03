"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

// The form (and its fetch logic) only downloads when someone clicks "Book".
const BookingPanel = dynamic(() => import("./BookingPanel"), {
  ssr: false,
  loading: () => <div className="skeleton h-64" />,
});

export default function BookingModal({
  kind,
  itemId,
  itemTitle,
  initialMessage,
  label = "Book now",
  className = "btn-dark !px-5 !py-2 text-sm",
}: {
  kind: "package" | "vehicle";
  itemId: string;
  itemTitle: string;
  initialMessage?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && setOpen(false)}
        className="w-[min(30rem,92vw)] rounded-3xl bg-transparent p-0 backdrop:bg-ink/60"
        aria-label={`Book ${itemTitle}`}
      >
        {open && (
          <div className="relative">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full p-2 hover:bg-mist"
            >
              <X size={18} />
            </button>
            <BookingPanel
              kind={kind}
              itemId={itemId}
              itemTitle={itemTitle}
              initialMessage={initialMessage}
            />
          </div>
        )}
      </dialog>
    </>
  );
}
