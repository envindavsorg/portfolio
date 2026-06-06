"use client";

import { Tabs as Primitive } from "@base-ui/react/tabs";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import useMeasure from "react-use-measure";

import { cn } from "@/lib/utils";

type TabsValue = string | number | null;

interface TabsContextType {
  value: TabsValue;
}

const TabsContext = createContext<TabsContextType | null>(null);

const useTabsValue = () => useContext(TabsContext)?.value ?? null;

type TabsProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  "onValueChange" | "value" | "defaultValue"
> & {
  value?: TabsValue;
  defaultValue?: TabsValue;
  onValueChange?: (value: string) => void;
};

export const Tabs = ({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState<TabsValue>(
    defaultValue ?? null
  );
  const value = valueProp ?? internalValue;

  const handleValueChange = useCallback(
    (next: TabsValue) => {
      setInternalValue(next);
      onValueChange?.(next as string);
    },
    [onValueChange]
  );

  const contextValue = useMemo(() => ({ value }), [value]);

  return (
    <TabsContext.Provider value={contextValue}>
      <Primitive.Root
        className={cn("flex flex-col gap-2", className)}
        data-slot="tabs"
        onValueChange={handleValueChange}
        value={value}
        {...props}
      />
    </TabsContext.Provider>
  );
};

export const TabsList = ({
  className,
  ...props
}: ComponentProps<typeof Primitive.List>) => (
  <Primitive.List
    className={cn(
      "inline-flex h-8 w-fit items-center justify-center rounded-md bg-transparent p-0.5 text-muted-foreground",
      className
    )}
    data-slot="tabs-list"
    {...props}
  />
);

type TabsTriggerProps = Omit<
  ComponentProps<typeof Primitive.Tab>,
  "render"
> & {
  asChild?: boolean;
};

export const TabsTrigger = ({
  asChild = false,
  className,
  value,
  children,
  ...props
}: TabsTriggerProps) => {
  const activeValue = useTabsValue();
  const dataState = activeValue === value ? "active" : "inactive";

  const triggerClassName = cn(
    "inline-flex flex-1 cursor-pointer items-center justify-center gap-2",
    "whitespace-nowrap rounded-md px-1.5 py-1 text-sm sm:text-base",
    "data-[state=active]:text-theme",
    "[&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    "transition-[color] disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    className
  );

  if (asChild) {
    return (
      <Primitive.Tab
        data-slot="tabs-trigger"
        data-state={dataState}
        render={children as ReactElement<Record<string, unknown>>}
        value={value}
        {...props}
      />
    );
  }

  return (
    <Primitive.Tab
      className={triggerClassName}
      data-slot="tabs-trigger"
      data-state={dataState}
      value={value}
      {...props}
    >
      {children}
    </Primitive.Tab>
  );
};

type TabsContentProps = ComponentProps<typeof Primitive.Panel>;

export const TabsContent = ({
  className,
  value,
  children,
  ...props
}: TabsContentProps) => {
  const activeValue = useTabsValue();
  const dataState = activeValue === value ? "active" : "inactive";

  return (
    <Primitive.Panel
      className={cn("flex-1 space-y-1 py-1 outline-none", className)}
      data-slot="tabs-content"
      data-state={dataState}
      value={value}
      {...props}
    >
      {children}
    </Primitive.Panel>
  );
};

interface Tab {
  id: number;
  label: string;
  content: ReactNode;
}

interface TabsAnimatedProps {
  tabs: Tab[];
  onChangeAction?: () => void;
  before?: boolean;
  after?: boolean;
  className?: string;
}

const contentVariants = {
  active: {
    filter: "blur(0px)",
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    filter: "blur(4px)",
    opacity: 0,
    x: -300 * direction,
  }),
  initial: (direction: number) => ({
    filter: "blur(4px)",
    opacity: 0,
    x: 300 * direction,
  }),
} as const;

const bubbleTransition = {
  bounce: 0.19,
  duration: 0.4,
  type: "spring",
} as const;

const springTransition = {
  bounce: 0.2,
  duration: 0.4,
  type: "spring",
} as const;

export const TabsAnimated = ({
  tabs,
  onChangeAction,
  before = false,
  after = true,
  className,
}: TabsAnimatedProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ref, bounds] = useMeasure();

  const content = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.content ?? null,
    [activeTab, tabs]
  );

  const handleTabClick = useCallback(
    (newTabId: number) => {
      if (newTabId === activeTab || isAnimating) {
        return;
      }

      setDirection(newTabId > activeTab ? 1 : -1);
      setActiveTab(newTabId);
      onChangeAction?.();
    },
    [activeTab, isAnimating, onChangeAction]
  );

  const handleAnimationStart = useCallback(
    () => setIsAnimating(true),
    []
  );
  const handleAnimationComplete = useCallback(
    () => setIsAnimating(false),
    []
  );

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className={cn(
          "grid w-full cursor-pointer grid-cols-2 gap-x-3 py-3",
          className,
          before && "screen-line-before",
          after && "screen-line-after"
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              className={cn(
                "relative flex items-center justify-center px-3 py-2",
                "cursor-pointer rounded-md border border-edge font-medium text-sm transition",
                "focus-visible:outline-none focus-visible:outline-1 focus-visible:ring-1",
                isActive ? "text-theme" : "text-foreground"
              )}
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{ WebkitTapHighlightColor: "transparent" }}
              type="button"
            >
              {isActive && (
                <motion.span
                  className="absolute inset-0 z-10 rounded-md border border-theme"
                  layoutId="bubble"
                  transition={bubbleTransition}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      <MotionConfig transition={springTransition}>
        <motion.div
          animate={{ height: bounds.height }}
          className="relative mx-auto h-full w-full overflow-hidden"
          initial={false}
        >
          <div ref={ref}>
            <AnimatePresence
              custom={direction}
              mode="popLayout"
              onExitComplete={handleAnimationComplete}
            >
              <motion.div
                animate="active"
                custom={direction}
                exit="exit"
                initial="initial"
                key={activeTab}
                onAnimationComplete={handleAnimationComplete}
                onAnimationStart={handleAnimationStart}
                variants={contentVariants}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
};
