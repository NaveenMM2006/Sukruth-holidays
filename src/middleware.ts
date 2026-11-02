import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin route protection is handled securely inside src/app/admin/layout.tsx using requireAdmin()
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
