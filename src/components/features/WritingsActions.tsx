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
import { m } from "@/paraglide/messages";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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

  const handleCopyPageUrl = useCallback(async () => {
    const copied = await copyText(url);

    if (!copied) {
      toast.error("", {
        description: m.writings_actions_toast_link_error(),
        duration: 3000,
        id: "copy-hint",
      });
      return;
    }

    toast.success("", {
      description: m.writings_actions_toast_link_copied(),
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
    let type = m.writings_actions_share_type_default();
    if (url.includes("article")) {
      type = m.writings_actions_share_type_article();
    } else if (url.includes("utils")) {
      type = m.writings_actions_share_type_util();
    } else if (url.includes("component")) {
      type = m.writings_actions_share_type_component();
    }

    const encodedText = encodeURIComponent(
      m.writings_actions_share_text({ type })
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
              aria-label={m.writings_actions_copy_link_aria()}
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
          <p>{m.writings_actions_tooltip_copy_link()}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <CopyButton
              getValueAction={handleCopyMarkdown}
              label={m.writings_actions_copy_markdown_aria()}
              size="icon"
              variant="outline"
            />
          }
        />
        <TooltipContent>
          <p>{m.writings_actions_tooltip_copy_markdown()}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              asChild
              onMouseEnter={twitter.handleMouseEnter}
              onMouseLeave={twitter.handleMouseLeave}
              size="icon"
              variant="outline"
            >
              <Link
                aria-label={m.writings_actions_share_x_aria()}
                href={shareUrls.x}
                rel="noopener noreferrer"
                target="_blank"
              >
                <TwitterIcon ref={twitter.ref} />
              </Link>
            </Button>
          }
        />
        <TooltipContent>
          <p>{m.writings_actions_tooltip_share_x()}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              asChild
              onMouseEnter={linkedin.handleMouseEnter}
              onMouseLeave={linkedin.handleMouseLeave}
              size="icon"
              variant="outline"
            >
              <Link
                aria-label={m.writings_actions_share_linkedin_aria()}
                href={shareUrls.linkedin}
                rel="noopener noreferrer"
                target="_blank"
              >
                <LinkedinIcon ref={linkedin.ref} />
              </Link>
            </Button>
          }
        />
        <TooltipContent>
          <p>{m.writings_actions_tooltip_share_linkedin()}</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={m.writings_actions_open_in_aria()}
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
            <DropdownMenuLabel>
              {m.writings_actions_dropdown_open_in()}
            </DropdownMenuLabel>
            {viewOptions.map(({ title, href, icon: Icon }) => (
              <DropdownMenuItem
                className="cursor-pointer items-center gap-x-2 py-1.5"
                key={href}
                render={
                  <Link
                    href={href}
                    rel="noreferrer noopener"
                    target="_blank"
                  />
                }
              >
                <Icon className="size-4" />
                {title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
