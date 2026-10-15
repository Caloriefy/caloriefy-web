import FramerPage from "@/components/framer-page";
import { getMetadata } from "@/lib/framer";

export const metadata = getMetadata("stories");

export default function Page() {
  return <FramerPage name="stories" />;
}
