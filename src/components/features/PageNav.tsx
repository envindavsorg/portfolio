"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { PageShortcuts } from "@/components/features/PageShortcuts";
import { ArrowLeft } from "@/components/motion/ArrowLeft";
import { ArrowRightIcon } from "@/components/motion/ArrowRight";
import { Button } from "@/components/primitives/Button";
import type { Content } from "@/lib/content";
import { copyText, getAbsoluteUrl } from "@/lib/functions";
import { soundManager } from "@/lib/sound-manager";

import { ArticleCopyMarkdown } from "../blog/ArticleCopyMarkdown";
import { ArticleViewOptions } from "../blog/ArticleViewOptions";
import { Link as LinkIcon } from "../motion/Link";
import { Linkedin } from "../motion/LinkedIn";
import { Twitter } from "../motion/Twitter";
import { PanelContent } from "../primitives/Panel";

const useAnimatedRef = () => {
  const ref = useRef<AnimatedIconHandle>(null);

  const handleMouseEnter = useCallback(
    () => ref.current?.startAnimation(),
    []
  );
  const handleMouseLeave = useCallback(
    () => ref.current?.stopAnimation(),
    []
  );

  return { handleMouseEnter, handleMouseLeave, ref } as const;
};

interface PageNavProps {
  item: Content;
  items: Content[];
  slug: string;
}

export const PageNav = ({ item, items, slug }: PageNavProps) => {
  const currentIndex = items.findIndex((i) => i.slug === slug);
  const previous = currentIndex > 0 ? items[currentIndex - 1] : null;
  const next =
    currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  const arrowLeft = useAnimatedRef();
  const arrowRight = useAnimatedRef();
  const link = useAnimatedRef();
  const twitter = useAnimatedRef();
  const linkedin = useAnimatedRef();

  const { category } = item.metadata;

  const path = `/${category}/${item.slug}`;
  const serverUrl = getAbsoluteUrl(path);
  const [absoluteUrl, setAbsoluteUrl] = useState(serverUrl);

  useEffect(() => {
    setAbsoluteUrl(new URL(path, window.location.origin).toString());
  }, [path]);

  const handleCopyPageUrl = useCallback(() => {
    copyText(absoluteUrl);

    toast.success("", {
      description: "lien copié avec succès !",
      duration: 3000,
      id: "copy-hint",
    });

    soundManager.playToastSound();
  }, [absoluteUrl]);

  const shareUrls = useMemo(() => {
    const encoded = encodeURIComponent(absoluteUrl);
    return {
      linkedin: `https://www.linkedin.com/sharing/share-offsite?url=${encoded}`,
      x: `https://x.com/intent/tweet?url=${encoded}`,
    };
  }, [absoluteUrl]);

  return (
    <>
      <PageShortcuts
        basePath={`/${category}`}
        next={next}
        previous={previous}
      />

      <PanelContent className="flex items-center justify-between space-y-0 py-2">
        <div className="flex items-center gap-x-3">
          {previous && (
            <Button
              asChild
              onMouseEnter={arrowLeft.handleMouseEnter}
              onMouseLeave={arrowLeft.handleMouseLeave}
              size="icon"
              variant="outline"
            >
              <Link
                aria-label="Précédent"
                href={`/${category}/${previous.slug}`}
              >
                <ArrowLeft ref={arrowLeft.ref} />
                <span className="sr-only">Précédent</span>
              </Link>
            </Button>
          )}
          {next && (
            <Button
              asChild
              onMouseEnter={arrowRight.handleMouseEnter}
              onMouseLeave={arrowRight.handleMouseLeave}
              size="icon"
              variant="outline"
            >
              <Link
                aria-label="Suivant"
                href={`/${category}/${next.slug}`}
              >
                <ArrowRightIcon ref={arrowRight.ref} />
                <span className="sr-only">Suivant</span>
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-x-3">
          <Button
            onMouseEnter={link.handleMouseEnter}
            onMouseLeave={link.handleMouseLeave}
            onClick={handleCopyPageUrl}
            size="icon"
            variant="outline"
          >
            <LinkIcon ref={link.ref} />
          </Button>
          <Button
            onMouseEnter={twitter.handleMouseEnter}
            onMouseLeave={twitter.handleMouseLeave}
            onClick={handleCopyPageUrl}
            size="icon"
            variant="outline"
          >
            <Link
              href={shareUrls.x}
              aria-label="Partager sur X"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Twitter ref={twitter.ref} />
            </Link>
          </Button>
          <Button
            onMouseEnter={linkedin.handleMouseEnter}
            onMouseLeave={linkedin.handleMouseLeave}
            size="icon"
            variant="outline"
          >
            <Link
              href={shareUrls.linkedin}
              aria-label="Partager sur LinkedIn"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Linkedin ref={linkedin.ref} />
            </Link>
          </Button>

          <ArticleViewOptions
            isComponent={category === "components"}
            markdownUrl={`/${category}/${item.slug}.mdx`}
          />
          <ArticleCopyMarkdown
            markdownUrl={`/${category}/${item.slug}.mdx`}
          />
        </div>
      </PanelContent>
    </>
  );
};
