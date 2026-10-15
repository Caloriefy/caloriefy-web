import FramerPage from "@/components/framer-page";
import { getMetadata } from "@/lib/framer";

export const metadata = getMetadata("privacy-policy");

export default function Page() {
  return <FramerPage name="privacy-policy" />;
}
