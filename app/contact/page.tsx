import FramerPage from "@/components/framer-page";
import { getMetadata } from "@/lib/framer";

export const metadata = getMetadata("contact");

export default function Page() {
  return <FramerPage name="contact" />;
}
