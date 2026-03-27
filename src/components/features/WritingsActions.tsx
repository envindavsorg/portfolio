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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../base/DropdownMenu";
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
import { DropdownMenuLabel } from "../primitives/DropdownMenu";
import { ChatGPT } from "../svgs/chatgpt";
import { Claude } from "../svgs/claude";
import { Markdown } from "../svgs/markdown";
import { V0 } from "../svgs/v0";

const cache = new Map<string, string>();

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
        title: "Markdown",
      },
      ...(isComponent
        ? [
            {
              href: `https://v0.app/?${new URLSearchParams({ q })}`,
              icon: Icons.v0,
              title: "v0",
            },
          ]
        : []),
      {
        href: `https://chatgpt.com/?${new URLSearchParams({ hints: "search", q })}`,
        icon: Icons.chatgpt,
        title: "ChatGPT",
      },
      {
        href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
        icon: Icons.claude,
        title: "Claude",
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
        <DropdownMenuTrigger
          render={
            <Button
              className="group/toggle"
              onMouseEnter={handleBotEnter}
              onMouseLeave={handleBotLeave}
              size="icon"
              variant="outline"
            >
              <Bot
                className="group-data-popup-open/toggle:hidden"
                ref={iconBotRef}
              />
              <X
                className="not-group-data-popup-open/toggle:hidden"
                ref={iconCloseRef}
              />
            </Button>
          }
        />
        <DropdownMenuContent align="start" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ouvrir dans :</DropdownMenuLabel>
            {viewOptions.map(({ title, href, icon: Icon }) => (
              <Link
                href={href}
                rel="noreferrer noopener"
                target="_blank"
                key={href}
              >
                <DropdownMenuItem className="gap-x-2 items-center py-1.5 cursor-pointer">
                  <Icon className="size-4" />
                  {title}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*<DropdownMenu>
        <DropdownMenuTrigger asChild>

        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-fit py-2 *:cursor-pointer"

        >

        </DropdownMenuContent>
      </DropdownMenu>*/}
    </div>
  );
};
