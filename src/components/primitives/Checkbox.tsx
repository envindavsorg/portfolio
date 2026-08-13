"use client";

import { Checkbox as Primitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "@phosphor-icons/react";
import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import type {
  ComponentProps,
  ComponentRef,
  ReactElement,
} from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export const Checkbox = forwardRef<
  ComponentRef<typeof Primitive.Root>,
  ComponentProps<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root
    className={cn(
      "peer grid size-4 shrink-0 place-content-center rounded-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "data-[checked]:bg-primary",
      "data-[checked]:text-primary-foreground",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "border border-primary ring-offset-background",
      className
    )}
    ref={ref}
    {...props}
  >
    <Primitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <CheckIcon className="size-4" />
    </Primitive.Indicator>
  </Primitive.Root>
));

// onCheckedChange base-ui: (checked, eventDetails) => void — on n'expose
// que `checked` pour préserver l'ancienne signature radix attendue par les
// consommateurs ((checked: boolean) => void).
type CheckboxAnimatedProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  "render" | "onCheckedChange"
> &
  Omit<
    HTMLMotionProps<"button">,
    keyof ComponentProps<typeof Primitive.Root>
  > & {
    onCheckedChange?: (checked: boolean) => void;
  };

export const CheckboxAnimated = ({
  className,
  checked: controlledChecked,
  defaultChecked,
  onCheckedChange,
  ...props
}: CheckboxAnimatedProps) => {
  const [isChecked, setIsChecked] = useState(
    controlledChecked ?? defaultChecked ?? false
  );

  useEffect(() => {
    if (controlledChecked !== undefined) {
      setIsChecked(controlledChecked);
    }
  }, [controlledChecked]);

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setIsChecked(checked);
      onCheckedChange?.(checked);
    },
    [onCheckedChange]
  );

  const indicator = (
    <motion.svg
      animate={isChecked ? "checked" : "unchecked"}
      className="size-3.5"
      data-slot="checkbox-indicator"
      fill="none"
      initial="unchecked"
      stroke="currentColor"
      strokeWidth="3.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M4.5 12.75l6 6 9-13.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          checked: {
            opacity: 1,
            pathLength: 1,
            transition: { delay: 0.2, duration: 0.2 },
          },
          unchecked: {
            opacity: 0,
            pathLength: 0,
            transition: { duration: 0.2 },
          },
        }}
      />
    </motion.svg>
  );

  // base-ui injecte ses props (role, aria, data-checked, onClick…) dans
  // l'élément `render`; motion.button n'accepte pas la totalité du type Root,
  // d'où le cast vers un élément à props ouvertes (même approche que Collapsible).
  const trigger = (
    <motion.button
      className={cn(
        "peer size-4 shrink-0 cursor-pointer rounded-sm border border-input outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "data-[checked]:border-theme data-[checked]:bg-theme data-[checked]:text-background",
        "transition-colors duration-500 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="checkbox"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...(props as HTMLMotionProps<"button">)}
    />
  ) as ReactElement<Record<string, unknown>>;

  return (
    <Primitive.Root
      checked={controlledChecked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      render={trigger}
    >
      <Primitive.Indicator keepMounted render={indicator} />
    </Primitive.Root>
  );
};
