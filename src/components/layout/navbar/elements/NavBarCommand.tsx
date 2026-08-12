"use client";

import { useCommandState } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RefObject } from "react";
import { toast } from "sonner";

import { Search } from "@/components/motion/Search";
import { Button } from "@/components/primitives/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/primitives/Command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/primitives/Dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/primitives/Drawer";
import { Kbd, KbdGroup } from "@/components/primitives/Kbd";
import { Separator } from "@/components/primitives/Separator";
import useMediaQuery from "@/hooks/useMediaQuery";
import {
  prefetchSearchIndex,
  useSearchIndex,
} from "@/hooks/useSearchIndex";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

import { CATEGORY, LABELS } from "./content";
import {
  buildKindMap,
  buildPostGroups,
  commandFilter,
  getFilteredGroups,
} from "./functions";
import type { CommandItemProps, CommandKind } from "./types";

interface CommandFooterProps {
  kindMap: Map<string, CommandKind>;
}

const CommandFooter = memo(({ kindMap }: CommandFooterProps) => {
  const kind = useCommandState(
    (state) => kindMap.get(state.value) ?? "page"
  );

  return (
    <div className="hidden h-12 items-center justify-end gap-x-4 border-input border-t px-4 sm:flex">
      <KbdGroup>
        <span className="font-medium text-xs">{LABELS[kind]()}</span>
        <Kbd>↵</Kbd>
      </KbdGroup>

      <Separator
        className="data-[orientation=vertical]:h-4"
        orientation="vertical"
      />

      <KbdGroup>
        <span className="font-medium text-xs">
          {m.nav_command_close()}
        </span>
        <Kbd>␛</Kbd>
      </KbdGroup>
    </div>
  );
});

interface CommandRowProps {
  item: CommandItemProps;
  index: number;
  onSelect: (url: string, newTab?: boolean) => void;
}

const CommandRow = memo(
  ({ item, index, onSelect }: CommandRowProps) => {
    const iconRef = useRef<AnimatedIconHandle>(null);
    const Icon = item.icon;
    const title = item.title();

    return (
      <CommandItem
        keywords={item.keywords}
        onMouseEnter={() => iconRef.current?.startAnimation?.()}
        onMouseLeave={() => iconRef.current?.stopAnimation?.()}
        onSelect={() => onSelect(item.url, item.openInNewTab)}
        value={title}
      >
        {Icon ? (
          <Icon
            ref={iconRef as RefObject<AnimatedIconHandle>}
            size={16}
          />
        ) : (
          <span>{index + 1}.</span>
        )}
        <p className="lowercase">{title}</p>
      </CommandItem>
    );
  }
);

interface CommandLinkGroupProps {
  heading: string;
  items: CommandItemProps[];
  onSelect: (url: string, newTab?: boolean) => void;
}

const CommandLinkGroup = memo(
  ({ heading, items, onSelect }: CommandLinkGroupProps) => (
    <CommandGroup heading={heading}>
      {items.map((item, idx) => (
        <CommandRow
          index={idx}
          item={item}
          key={item.title()}
          onSelect={onSelect}
        />
      ))}
    </CommandGroup>
  )
);

export const NavBarCommand = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // l'index n'est plus une prop : il était sérialisé dans le payload RSC de
  // chaque page du site, pour une palette que la plupart des visiteurs
  // n'ouvrent jamais. Il se charge à la première ouverture, et au survol du
  // déclencheur — donc il est déjà là au moment du clic.
  const { docs: posts } = useSearchIndex(open);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.isContentEditable ||
        target.matches("input, textarea, select")
      ) {
        return;
      }

      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        event.key === "/"
      ) {
        event.preventDefault();
        setOpen((prev) => {
          // fermer au clavier ne déclenche pas onOpenChange : sans ça le toast
          // à durée infinie posé par handleOpen restait affiché pour toujours
          if (prev) {
            toast.dismiss("command-hint");
            triggerRef.current?.focus();
          }
          return !prev;
        });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const kindMap = useMemo(() => buildKindMap(posts), [posts]);
  const postGroups = useMemo(() => buildPostGroups(posts), [posts]);
  const filteredGroups = useMemo(
    () => getFilteredGroups(pathname),
    [pathname]
  );

  const handleSelect = useCallback(
    (href: string, openInNewTab = false) => {
      setOpen(false);

      if (openInNewTab) {
        window.open(href, "_blank", "noopener");
        return;
      }

      if (href.startsWith("/#")) {
        const hash = href.slice(1);
        if (pathname !== "/") {
          window.location.href = localizeHref(href);
          return;
        }
        document
          .querySelector(hash)
          ?.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", hash);
        return;
      }

      router.push(localizeHref(href));
    },
    [router, pathname]
  );

  const Wrapper = isDesktop ? Dialog : Drawer;
  const Content = isDesktop ? DialogContent : DrawerContent;
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  const Description = isDesktop
    ? DialogDescription
    : DrawerDescription;

  const handleOpen = useCallback(() => {
    // pas de blur ici : retirer le focus du déclencheur avant l'ouverture ne
    // laisse aucun point de retour à la fermeture, et le focus repart au début
    // du document.
    setOpen(true);
    toast.info("", {
      description: m.nav_command_drawer_hint(),
      duration: Number.POSITIVE_INFINITY,
      id: "command-hint",
    });
  }, []);

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    if (!value) {
      toast.dismiss("command-hint");
      // la palette n'est pas montée via DialogTrigger : la restauration
      // automatique du focus par Base UI n'a pas de cible, on la fait à la main
      triggerRef.current?.focus();
    }
  }, []);

  return (
    <>
      <Button
        onClick={handleOpen}
        // le temps d'amener la souris jusqu'au bouton puis de cliquer, l'index
        // est déjà chargé : le focus couvre le même besoin au clavier
        onFocus={prefetchSearchIndex}
        onPointerEnter={prefetchSearchIndex}
        ref={triggerRef}
        size="icon"
        variant="outline"
      >
        <Search />
        <span className="sr-only">{m.nav_command_search()}</span>
      </Button>

      <Wrapper onOpenChange={handleOpenChange} open={open}>
        <Content
          className={cn(
            "overflow-hidden bg-popover p-0 backdrop-blur-lg supports-backdrop-filter:bg-popover/90",
            isDesktop && "max-sm:top-16 max-sm:translate-y-0"
          )}
          {...(isDesktop && {
            "data-slot": "command-dialog-content",
            overlay: true,
          })}
        >
          <div className="sr-only">
            <Title>{m.nav_command_dialog_title()}</Title>
            <Description>
              {m.nav_command_dialog_description()}
            </Description>
          </div>

          <Command filter={commandFilter}>
            <CommandInput
              className={cn(
                "border-input sm:border-b",
                "max-sm:mx-4 max-sm:mt-2 max-sm:mb-4 max-sm:rounded-full max-sm:border"
              )}
            />

            <CommandList className="max-sm:border-input max-sm:border-t max-sm:py-2">
              <CommandEmpty />

              <div className="max-sm:mx-2">
                {filteredGroups.map(({ heading, items }) => (
                  <CommandLinkGroup
                    heading={heading()}
                    items={items}
                    key={heading()}
                    onSelect={handleSelect}
                  />
                ))}
              </div>

              <div className="max-sm:mx-2">
                {Object.entries(CATEGORY).map(
                  ([category, config]) =>
                    postGroups[category]?.length > 0 && (
                      <CommandLinkGroup
                        heading={config.heading()}
                        items={postGroups[category]}
                        key={category}
                        onSelect={handleSelect}
                      />
                    )
                )}
              </div>
            </CommandList>

            <CommandFooter kindMap={kindMap} />
          </Command>
        </Content>
      </Wrapper>
    </>
  );
};
