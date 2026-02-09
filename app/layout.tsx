// pacaprints-ops/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import TopNav from "./components/TopNav";

export const metadata: Metadata = {
  title: "PacaPrints Ops",
  description: "PacaPrints internal ops app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <main className="pp-container py-6">{children}</main>
      </body>
    </html>
  );
}
