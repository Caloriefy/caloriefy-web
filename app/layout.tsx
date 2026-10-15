import Script from "next/script";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        {/* Mounts a DOM node into <body>, so it must run after React has hydrated. */}
        <Script src="/cursor-ring-field.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
