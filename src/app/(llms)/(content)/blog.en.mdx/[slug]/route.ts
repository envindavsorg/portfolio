import { markdownStaticParams, serveMarkdown } from "@/lib/llms";

// Pendant anglais de blog.mdx/[slug] : atteint via les réécritures
// /en/<catégorie>/<slug>.mdx définies dans next.config.ts.
export const generateStaticParams = async (): Promise<
  { slug: string }[]
> => markdownStaticParams("en");

interface ParamsProps {
  params: Promise<{ slug: string }>;
}

export const GET = async (
  _request: Request,
  { params }: ParamsProps
): Promise<Response> => {
  const { slug } = await params;
  return serveMarkdown(slug, "en");
};
