import BlogsMenu from "@/components/blogs-menu";
import FramerPage from "@/components/framer-page";
import { getMetadata } from "@/lib/framer";

export const metadata = getMetadata("blogs");

export default function Page() {
  return (
    <>
      <FramerPage name="blogs" />
      <BlogsMenu />
    </>
  );
}
