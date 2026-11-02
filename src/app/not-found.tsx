import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[55vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-6xl font-extrabold text-lagoon">Wrong turn</p>
        <p className="mt-3 text-ink/70">We could not find that page.</p>
        <Link href="/packages" className="btn-primary mt-6">See packages</Link>
      </div>
    </div>
  );
}
