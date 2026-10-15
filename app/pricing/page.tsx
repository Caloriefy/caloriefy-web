import FramerPage from "@/components/framer-page";
import PricingFolders from "@/components/pricing-folders";
import { getMetadata } from "@/lib/framer";

export const metadata = getMetadata("pricing");

export default function Page() {
  return (
    <>
      <FramerPage name="pricing" />
      <PricingFolders />
    </>
  );
}
