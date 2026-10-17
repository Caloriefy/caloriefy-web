import Script from "next/script";
import FramerLinks from "@/components/framer-links";
import { COPYRIGHT_YEAR } from "@/lib/framer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-copyright-year={COPYRIGHT_YEAR} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <FramerLinks />
        {/* Mounts a DOM node into <body>, so it must run after React has hydrated. */}
        <Script src="/cursor-ring-field.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
