import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user?.isAdmin) redirect("/login?callbackUrl=/admin");

  return (
    <div className="min-h-screen bg-mist/60">
      <AdminNav name={session.user.email || ""} />
      <div className="md:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
