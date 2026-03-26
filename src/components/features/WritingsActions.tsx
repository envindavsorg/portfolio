"use client";

import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import useAnimatedRef from "@/hooks/useAnimatedRef";
import { copyText, getPrompt } from "@/lib/functions";
import { soundManager } from "@/lib/sound-manager";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../base/Tooltip";
import { Bot } from "../motion/Bot";
import { Link as LinkIcon } from "../motion/Link";
import { Linkedin as LinkedinIcon } from "../motion/LinkedIn";
import { Twitter as TwitterIcon } from "../motion/Twitter";
import { X } from "../motion/X";
import { Button, CopyButton } from "../primitives/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu";
import { ChatGPT } from "../svgs/chatgpt";
import { Claude } from "../svgs/claude";
import { Markdown } from "../svgs/markdown";
import { V0 } from "../svgs/v0";

const cache = new Map<string, string>();
const preventAutoFocus = (event: Event) => event.preventDefault();

type IconProps = HTMLAttributes<SVGElement>;
const Icons: Record<string, (props: IconProps) => ReactNode> = {
  chatgpt: (props) => <ChatGPT {...props} />,
  claude: (props) => <Claude {...props} />,
  markdown: (props) => <Markdown {...props} />,
  v0: (props) => <V0 {...props} />,
};

interface WritingsActionsProps {
  url: string;
  markdownUrl: string;
  isComponent?: boolean;
}

export const WritingsActions = ({
  url,
  markdownUrl,
  isComponent = false,
}: WritingsActionsProps) => {
  const link = useAnimatedRef();
  const twitter = useAnimatedRef();
  const linkedin = useAnimatedRef();
  const iconBotRef = useRef<AnimatedIconHandle>(null);
  const iconCloseRef = useRef<AnimatedIconHandle>(null);

  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const handleCopyPageUrl = useCallback(() => {
    copyText(url);
    toast.success("", {
      description: "lien copié avec succès !",
      duration: 3000,
      id: "copy-hint",
    });
    soundManager.playToastSound();
  }, [url]);

  const handleCopyMarkdown = useCallback(async () => {
    const cached = cache.get(markdownUrl);
    if (cached) {
      return cached;
    }

    const res = await fetch(markdownUrl);
    if (!res.ok) {
      throw new Error(`${res.status}`);
    }

    const text = await res.text();
    cache.set(markdownUrl, text);
    return text;
  }, [markdownUrl]);

  const shareUrls = useMemo(() => {
    const encodedUrl = encodeURIComponent(url);
    let type = "ceci";
    if (url.includes("article")) {
      type = "cet article";
    } else if (url.includes("utils")) {
      type = "cet outil";
    } else if (url.includes("component")) {
      type = "ce composant";
    }

    const encodedText = encodeURIComponent(
      `Découvrez ${type} sur mon portfolio :\n`
    );

    return {
      linkedin: `https://www.linkedin.com/sharing/share-offsite?url=${encodedUrl}`,
      x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    };
  }, [url]);

  const viewOptions = useMemo(() => {
    const fullUrl = origin
      ? new URL(markdownUrl, origin).toString()
      : markdownUrl;
    const q = getPrompt(
      fullUrl,
      isComponent ? "component" : "general"
    );

    return [
      {
        href: fullUrl,
        icon: Icons.markdown,
        title: "voir en Markdown",
      },
      ...(isComponent
        ? [
            {
              href: `https://v0.app/?${new URLSearchParams({ q })}`,
              icon: Icons.v0,
              title: "ouvrir dans v0",
            },
          ]
        : []),
      {
        href: `https://chatgpt.com/?${new URLSearchParams({ hints: "search", q })}`,
        icon: Icons.chatgpt,
        title: "ouvrir dans ChatGPT",
      },
      {
        href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
        icon: Icons.claude,
        title: "ouvrir dans Claude",
      },
    ];
  }, [markdownUrl, isComponent, origin]);

  const handleBotEnter = useCallback(() => {
    iconBotRef.current?.startAnimation();
    iconCloseRef.current?.startAnimation();
  }, []);

  const handleBotLeave = useCallback(() => {
    iconBotRef.current?.stopAnimation();
    iconCloseRef.current?.stopAnimation();
  }, []);

  return (
    <div className="flex items-center gap-x-3">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onMouseEnter={link.handleMouseEnter}
              onMouseLeave={link.handleMouseLeave}
              onClick={handleCopyPageUrl}
              size="icon"
              variant="outline"
            >
              <LinkIcon ref={link.ref} />
            </Button>
          }
        />
        <TooltipContent>
          <p>Copier le lien</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <CopyButton
              getValueAction={handleCopyMarkdown}
              label="copier le markdown dans le presse-papier"
              size="icon"
              variant="outline"
            />
          }
        />
        <TooltipContent>
          <p>Copier le markdown</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onMouseEnter={twitter.handleMouseEnter}
              onMouseLeave={twitter.handleMouseLeave}
              size="icon"
              variant="outline"
            >
              <Link
                href={shareUrls.x}
                aria-label="Partager sur X"
                rel="noopener noreferrer"
                target="_blank"
              >
                <TwitterIcon ref={twitter.ref} />
              </Link>
            </Button>
          }
        />
        <TooltipContent>
          <p>Partager sur X</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
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
                <LinkedinIcon ref={linkedin.ref} />
              </Link>
            </Button>
          }
        />
        <TooltipContent>
          <p>Partager sur LinkedIn</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="group/toggle"
            onMouseEnter={handleBotEnter}
            onMouseLeave={handleBotLeave}
            size="icon"
            variant="outline"
          >
            <Bot
              className="group-data-[state=open]/toggle:hidden"
              ref={iconBotRef}
            />
            <X
              className="group-data-[state=closed]/toggle:hidden"
              ref={iconCloseRef}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-fit py-2 *:cursor-pointer"
          collisionPadding={8}
          onCloseAutoFocus={preventAutoFocus}
          sideOffset={8}
        >
          {viewOptions.map(({ title, href, icon: Icon }) => (
            <DropdownMenuItem
              asChild
              className="lowercase"
              key={href}
            >
              <Link
                href={href}
                rel="noreferrer noopener"
                target="_blank"
              >
                <Icon className="size-4" />
                {title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
