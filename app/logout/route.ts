// pacaprints-ops/app/logout/route.ts

import { NextResponse } from "next/server";
import { supabaseServer } from "../lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  return NextResponse.redirect(new URL("/login", base));
}
