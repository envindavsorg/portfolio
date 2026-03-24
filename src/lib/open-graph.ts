import type { Metadata } from "next";

interface OGImageParams {
  type?: PageType;
  title: string;
  description?: string;
}

const buildOGImageUrl = ({
  type = "homepage",
  title,
  description,
}: OGImageParams): string => {
  const params = new URLSearchParams({ title: title.trim(), type });
  if (description?.trim()) {
    params.set("description", description.trim());
  }
  return `https://cuzeacflorin.fr/api/og?${params}`;
};

interface ContentMetadataParams {
  title: string;
  description: string;
  ogImageParams: OGImageParams;
}

export const buildContentMetadata = ({
  title,
  description,
  ogImageParams,
}: ContentMetadataParams): Metadata => {
  const imageUrl = buildOGImageUrl(ogImageParams);
  return {
    description,
    openGraph: {
      description,
      images: [
        { alt: title, height: 630, url: imageUrl, width: 1200 },
      ],
      title,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [imageUrl],
      title,
    },
  };
};
