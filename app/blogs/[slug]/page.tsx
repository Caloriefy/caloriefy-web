import FramerPage from "@/components/framer-page";
import { getMetadata, getSlugs } from "@/lib/framer";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getSlugs("blogs").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return getMetadata(`blogs/${slug}`);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <FramerPage name={`blogs/${slug}`} />;
}
