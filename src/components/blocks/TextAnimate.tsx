"use client";

import { AnimatePresence, motion } from "motion/react";
import type { MotionProps, Variants } from "motion/react";
import { memo } from "react";
import type { ElementType } from "react";

import { cn } from "@/lib/utils";

type AnimationType = "text" | "word" | "character" | "line";
type AnimationVariant =
  | "fadeIn"
  | "blurIn"
  | "blurInUp"
  | "blurInDown"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown";

interface TextAnimateProps extends MotionProps {
  children: string;
  className?: string;
  segmentClassName?: string;
  delay?: number;
  duration?: number;
  variants?: Variants;
  as?: ElementType;
  by?: AnimationType;
  startOnView?: boolean;
  once?: boolean;
  animation?: AnimationVariant;
  accessible?: boolean;
  themed?: boolean;
}

const staggerTimings: Record<AnimationType, number> = {
  character: 0.03,
  line: 0.06,
  text: 0.06,
  word: 0.05,
};

const defaultContainerVariants = {
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0,
      staggerChildren: 0.05,
    },
  },
};

const defaultItemVariants: Variants = {
  exit: {
    opacity: 0,
  },
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
  },
};

const defaultItemAnimationVariants: Record<
  AnimationVariant,
  { container: Variants; item: Variants }
> = {
  blurIn: {
    container: defaultContainerVariants,
    item: {
      exit: {
        filter: "blur(10px)",
        opacity: 0,
        transition: { duration: 0.3 },
      },
      hidden: { filter: "blur(10px)", opacity: 0 },
      show: {
        filter: "blur(0px)",
        opacity: 1,
        transition: {
          duration: 0.3,
        },
      },
    },
  },
  blurInDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { filter: "blur(10px)", opacity: 0, y: -20 },
      show: {
        filter: "blur(0px)",
        opacity: 1,
        transition: {
          filter: { duration: 0.3 },
          opacity: { duration: 0.4 },
          y: { duration: 0.3 },
        },
        y: 0,
      },
    },
  },
  blurInUp: {
    container: defaultContainerVariants,
    item: {
      exit: {
        filter: "blur(10px)",
        opacity: 0,
        transition: {
          filter: { duration: 0.3 },
          opacity: { duration: 0.4 },
          y: { duration: 0.3 },
        },
        y: 20,
      },
      hidden: { filter: "blur(10px)", opacity: 0, y: 20 },
      show: {
        filter: "blur(0px)",
        opacity: 1,
        transition: {
          filter: { duration: 0.3 },
          opacity: { duration: 0.4 },
          y: { duration: 0.3 },
        },
        y: 0,
      },
    },
  },
  fadeIn: {
    container: defaultContainerVariants,
    item: {
      exit: {
        opacity: 0,
        transition: { duration: 0.3 },
        y: 20,
      },
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        transition: {
          duration: 0.3,
        },
        y: 0,
      },
    },
  },
  scaleDown: {
    container: defaultContainerVariants,
    item: {
      exit: {
        opacity: 0,
        scale: 1.5,
        transition: { duration: 0.3 },
      },
      hidden: { opacity: 0, scale: 1.5 },
      show: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          scale: {
            damping: 15,
            stiffness: 300,
            type: "spring",
          },
        },
      },
    },
  },
  scaleUp: {
    container: defaultContainerVariants,
    item: {
      exit: {
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.3 },
      },
      hidden: { opacity: 0, scale: 0.5 },
      show: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          scale: {
            damping: 15,
            stiffness: 300,
            type: "spring",
          },
        },
      },
    },
  },
  slideDown: {
    container: defaultContainerVariants,
    item: {
      exit: {
        opacity: 0,
        transition: { duration: 0.3 },
        y: 20,
      },
      hidden: { opacity: 0, y: -20 },
      show: {
        opacity: 1,
        transition: { duration: 0.3 },
        y: 0,
      },
    },
  },
  slideLeft: {
    container: defaultContainerVariants,
    item: {
      exit: {
        opacity: 0,
        transition: { duration: 0.3 },
        x: -20,
      },
      hidden: { opacity: 0, x: 20 },
      show: {
        opacity: 1,
        transition: { duration: 0.3 },
        x: 0,
      },
    },
  },
  slideRight: {
    container: defaultContainerVariants,
    item: {
      exit: {
        opacity: 0,
        transition: { duration: 0.3 },
        x: 20,
      },
      hidden: { opacity: 0, x: -20 },
      show: {
        opacity: 1,
        transition: { duration: 0.3 },
        x: 0,
      },
    },
  },
  slideUp: {
    container: defaultContainerVariants,
    item: {
      exit: {
        opacity: 0,
        transition: {
          duration: 0.3,
        },
        y: -20,
      },
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        transition: {
          duration: 0.3,
        },
        y: 0,
      },
    },
  },
};

/**
 * Les composants Motion sont créés UNE fois par balise, puis réutilisés.
 *
 * `motion.create()` rend un nouveau TYPE de composant à chaque appel. Appelé
 * dans le corps du rendu, il en fabriquait donc un neuf à chaque fois — et pour
 * React, un type différent n'est pas le même composant : il démontait l'arbre et
 * le remontait. L'animation repartait de `hidden` sans jamais aboutir, les
 * caractères restaient à `opacity: 0`, et le `memo` autour du composant ne
 * servait plus à rien puisque son rendu produisait toujours du neuf.
 *
 * C'est la leçon déjà notée dans ce dépôt pour `motion.create(Image)` : au
 * niveau MODULE, jamais dans le rendu.
 */
const motionComponents = new Map<ElementType, ElementType>();

const getMotionComponent = (component: ElementType): ElementType => {
  const cached = motionComponents.get(component);

  if (cached) {
    return cached;
  }

  const created = motion.create(
    component as Parameters<typeof motion.create>[0]
  ) as ElementType;
  motionComponents.set(component, created);

  return created;
};

const TextAnimateBase = ({
  children,
  delay = 0,
  duration = 0.3,
  variants,
  className,
  segmentClassName,
  as: Component = "p",
  startOnView = true,
  /**
   * `true` par DÉFAUT : le texte s'anime une fois, puis reste visible.
   *
   * Avec `false`, Motion rejoue la variante `hidden` dès que l'élément quitte le
   * cadre — donc un titre déjà lu redevenait INVISIBLE en remontant la page, et
   * la mise en page gardait sa bande vide à la place. Ce n'était pas une
   * animation qui manquait, c'était un titre absent.
   *
   * Un texte qui disparaît en défilant n'est utile à personne ; celui qui veut
   * le comportement d'origine passe `once={false}` explicitement.
   */
  once = true,
  by = "word",
  animation = "fadeIn",
  accessible = true,
  themed = false,
  ...props
}: TextAnimateProps) => {
  const MotionComponent = getMotionComponent(Component);

  let segments: string[] = [];
  switch (by) {
    case "word": {
      segments = children.split(/(\s+)/u);
      break;
    }
    case "character": {
      segments = [...children];
      break;
    }
    case "line": {
      segments = children.split("\n");
      break;
    }
    default: {
      segments = [children];
      break;
    }
  }

  const getFinalVariants = () => {
    if (variants) {
      return {
        container: {
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: duration / segments.length,
              staggerDirection: -1,
            },
          },
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              delayChildren: delay,
              opacity: { delay, duration: 0.01 },
              staggerChildren: duration / segments.length,
            },
          },
        },
        item: variants,
      };
    }

    if (animation) {
      return {
        container: {
          ...defaultItemAnimationVariants[animation].container,
          exit: {
            ...defaultItemAnimationVariants[animation].container.exit,
            transition: {
              staggerChildren: duration / segments.length,
              staggerDirection: -1,
            },
          },
          show: {
            ...defaultItemAnimationVariants[animation].container.show,
            transition: {
              delayChildren: delay,
              staggerChildren: duration / segments.length,
            },
          },
        },
        item: defaultItemAnimationVariants[animation].item,
      };
    }

    return {
      container: defaultContainerVariants,
      item: defaultItemVariants,
    };
  };

  const finalVariants = getFinalVariants();

  return (
    <AnimatePresence mode="popLayout">
      {/**
       * La CLÉ dépend du texte.
       *
       * Avec `once`, Motion cesse d'observer après la première entrée dans le
       * cadre. Si les segments changent ensuite — un titre qui passe de
       * « titre » à « -- titre -- » —, les nouveaux caractères montent en
       * `hidden` et plus rien ne déclenche `show` : le texte reste invisible.
       * Changer de clé remonte proprement le bloc, qui rejoue son entrée.
       */}
      <MotionComponent
        key={children}
        animate={startOnView ? undefined : "show"}
        aria-label={accessible ? children : undefined}
        className={cn("whitespace-pre-wrap", className)}
        exit="exit"
        initial="hidden"
        variants={finalVariants.container as Variants}
        viewport={{ once }}
        whileInView={startOnView ? "show" : undefined}
        {...props}
      >
        {accessible && <span className="sr-only">{children}</span>}
        {segments.map((segment, i) => (
          <motion.span
            aria-hidden={accessible ? true : undefined}
            className={cn(
              "font-pixel-square",
              by === "word" && "text-balance text-foreground text-sm",
              themed && "text-theme",
              by === "line" ? "block" : "inline-block whitespace-pre",
              by === "character" && "",
              segmentClassName
            )}
            custom={i * staggerTimings[by]}
            key={`${by}-${segment}-${i}`}
            variants={finalVariants.item}
          >
            {segment}
          </motion.span>
        ))}
      </MotionComponent>
    </AnimatePresence>
  );
};

export const TextAnimate = memo(TextAnimateBase);
