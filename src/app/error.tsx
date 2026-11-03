"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x grid min-h-[55vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-5xl font-extrabold text-red-600">Something went wrong</p>
        <p className="mt-3 text-ink/70">An unexpected error occurred while loading this page.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-dark">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

