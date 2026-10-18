import FooterWordmark from "@/components/footer-wordmark";
import FramerLinks from "@/components/framer-links";
import Particles from "@/components/Particles";
import { COPYRIGHT_YEAR } from "@/lib/framer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-copyright-year={COPYRIGHT_YEAR} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "#ffffff" }}
        >
          <Particles
            particleColors={["#a8d49a", "#529344", "#21bf2b"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            glow={0.5}
            twinkle={0.3}
            moveParticlesOnHover
            hoverEffect="parallax"
            clickBurst={false}
          />
        </div>
        {children}
        <FooterWordmark />
        <FramerLinks />
      </body>
    </html>
  );
}
