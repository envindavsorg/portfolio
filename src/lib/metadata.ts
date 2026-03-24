import type { Metadata } from "next";

interface OpenGraphImageParams {
  description?: string;
  title: string;
  type?: string;
}

interface MetadataConfig {
  description: string;
  ogImageParams?: OpenGraphImageParams;
  path?: string;
  title: string;
}

const BASE_URL = "https://cuzeacflorin.fr";

const openGraphImage = ({
  description,
  title,
  type = "homepage",
}: OpenGraphImageParams): string => {
  const params = new URLSearchParams({ title: title.trim(), type });
  if (description?.trim()) {
    params.set("description", description.trim());
  }
  return `${BASE_URL}/api/og?${params}`;
};

export const createMetadata = ({
  description,
  ogImageParams,
  path,
  title,
}: MetadataConfig): Metadata => {
  const url = path ? `${BASE_URL}${path}` : undefined;
  const imageUrl = ogImageParams
    ? openGraphImage(ogImageParams)
    : undefined;

  return {
    ...(url && { alternates: { canonical: url } }),
    description,
    openGraph: {
      description,
      ...(imageUrl && {
        images: [
          { alt: title, height: 630, url: imageUrl, width: 1200 },
        ],
      }),
      title,
      type: "website",
      ...(url && { url }),
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      ...(imageUrl && { images: [imageUrl] }),
      title,
    },
  };
};
