// pacaprints-ops/app/login/page.tsx

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 max-w-md mx-auto">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
