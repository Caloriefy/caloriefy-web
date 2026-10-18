import DownloadHero from "@/components/download-hero";
import FramerPage from "@/components/framer-page";
import { getMetadata } from "@/lib/framer";

export const metadata = getMetadata("download");

export default function Page() {
  return (
    <>
      <FramerPage name="download" />
      <DownloadHero />
    </>
  );
}
