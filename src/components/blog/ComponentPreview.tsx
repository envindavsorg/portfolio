"use client";

import Link from "next/link";
import type React from "react";
import type { ComponentProps } from "react";
import { Children, Suspense, useMemo, useRef, useState } from "react";

import { Index } from "@/__registry__";
import { Refresh } from "@/components/motion/Refresh";
import { Button } from "@/components/primitives/Button";
import { TabsAnimated } from "@/components/primitives/Tabs";
import { Code as CodeInline } from "@/components/primitives/Typography";
import { V0Icon } from "@/components/svgs/stack/V0";
import { toPlaygroundName } from "@/lib/playground";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { PLAYGROUNDS } from "@/registry/playgrounds";

import { CodeCollapsibleWrapper } from "./CodeCollapsibleWrapper";
import { ComponentPlayground } from "./ComponentPlayground";

type ComponentPreviewProps = ComponentProps<"div"> & {
  name: string;
  openInV0Url?: string;
  canReplay?: boolean;
  notProse?: boolean;
  codeCollapsible?: boolean;
};

export const ComponentPreview = ({
  name,
  openInV0Url,
  canReplay = false,
  notProse = true,
  codeCollapsible = false,
  children,
  ...props
}: ComponentPreviewProps) => {
  const [replay, setReplay] = useState(0);

  const Codes = Children.toArray(children) as React.ReactElement[];
  const [Code] = Codes;

  const Preview = useMemo(() => {
    const Component = Index[name]?.component;
    if (!Component) {
      return (
        <p className="text-muted-foreground text-sm">
          {getLocale() === "en" ? (
            <>
              -- the{" "}
              <CodeInline className="font-semibold">
                {name}
              </CodeInline>{" "}
              component doesn't exist in the registry --
            </>
          ) : (
            <>
              -- le composant{" "}
              <CodeInline className="font-semibold">
                {name}
              </CodeInline>{" "}
              n'existe pas dans le registre --
            </>
          )}
        </p>
      );
    }

    return <Component />;
  }, [name]);

  const iconRef = useRef<AnimatedIconHandle>(null);

  const tabs = [
    {
      content: (
        <div className="rounded-md border border-input bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-center bg-size-[10px_10px] bg-zinc-950/0.75 p-4 [--pattern-foreground:var(--color-zinc-950)]/5 dark:bg-white/0.75 dark:[--pattern-foreground:var(--color-white)]/5">
          {(canReplay || openInV0Url) && (
            <div className="flex justify-end gap-x-3">
              {canReplay && (
                <Button
                  // un bouton à icône seule sans nom : un lecteur d'écran
                  // n'annonçait que « bouton »
                  aria-label={m.writings_component_preview_replay_aria()}
                  onClick={() => {
                    setReplay((v) => v + 1);
                    iconRef.current?.startAnimation();
                    iconRef.current?.stopAnimation();
                  }}
                  onMouseEnter={() =>
                    iconRef.current?.startAnimation()
                  }
                  onMouseLeave={() =>
                    iconRef.current?.stopAnimation()
                  }
                  size="icon"
                  variant="outline"
                >
                  <Refresh ref={iconRef} />
                </Button>
              )}

              {openInV0Url && (
                <Button asChild variant="outline">
                  <Link
                    aria-label={m.writings_component_preview_open_v0_aria()}
                    href={`https://v0.app/chat/api/open?url=${openInV0Url}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {m.writings_component_preview_open_in()}{" "}
                    <V0Icon className="size-5" />
                  </Link>
                </Button>
              )}
            </div>
          )}

          <div
            className="flex min-h-80 items-center justify-center"
            data-screenshot-anchor-target-for-capture
            key={replay}
          >
            <Suspense>{Preview}</Suspense>
          </div>
        </div>
      ),
      id: 0,
      label: m.writings_component_preview_tab_preview(),
    },
    {
      content: (
        <div className="[&>figure]:m-0 [&_button.absolute]:top-3 [&_button.absolute]:right-3">
          {codeCollapsible ? (
            <CodeCollapsibleWrapper>{Code}</CodeCollapsibleWrapper>
          ) : (
            Code
          )}
        </div>
      ),
      id: 1,
      label: m.writings_component_preview_tab_code(),
    },
  ];

  // un composant sans prop réglable n'a pas d'onglet : proposer un bac à sable
  // vide serait pire que ne rien proposer
  const playgroundName = toPlaygroundName(name);
  const definition = PLAYGROUNDS[playgroundName];

  if (definition) {
    tabs.push({
      content: (
        <ComponentPlayground
          definition={definition}
          name={playgroundName}
        />
      ),
      id: 2,
      label: m.writings_component_preview_tab_playground(),
    });
  }

  return (
    <div className={cn(notProse && "not-prose")} {...props}>
      <TabsAnimated
        after={false}
        className={cn(
          "ms-auto max-w-sm pt-0",
          tabs.length > 2 && "max-w-md grid-cols-3"
        )}
        tabs={tabs}
      />
    </div>
  );
};
