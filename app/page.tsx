import FramerPage from "@/components/framer-page";
import FoodSuggestionsCursor from "@/components/food-suggestions-cursor";
import ResultCards from "@/components/result-cards";
import PricingFolders from "@/components/pricing-folders";
import { getMetadata } from "@/lib/framer";

export const metadata = getMetadata("index");

export default function Home() {
  return (
    <>
      <FramerPage name="index" />
      <FoodSuggestionsCursor />
      <ResultCards />
      <PricingFolders />
    </>
  );
}
