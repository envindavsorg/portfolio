import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";

import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/blocks/Marquee";
import { PanelContent } from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";
import { CSSIcon } from "@/components/svgs/stack/CSS";
import { HTML5Icon } from "@/components/svgs/stack/HTML";
import { JavaScriptIcon } from "@/components/svgs/stack/JavaScript";
import { NextJSIcon } from "@/components/svgs/stack/Next";
import { ReactIcon } from "@/components/svgs/stack/React";
import { TailwindIcon } from "@/components/svgs/stack/Tailwind";
import { TypeScriptIcon } from "@/components/svgs/stack/TypeScript";

export interface Stack {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
}

export const CONTENT: Stack[] = [
  { icon: HTML5Icon, title: "HTML5" },
  { icon: CSSIcon, title: "CSS" },
  { icon: JavaScriptIcon, title: "JavaScript" },
  { icon: TypeScriptIcon, title: "TypeScript" },
  { icon: ReactIcon, title: "React" },
  { icon: NextJSIcon, title: "Next.js" },
  { icon: TailwindIcon, title: "Tailwind CSS" },
];

interface AboutContentProps {
  expanded: boolean;
}

export const AboutContent = memo(
  ({ expanded }: AboutContentProps) => (
    <PanelContent>
      <Prose>
        -- tout a commencé lorsqu'un ami m'a initié aux bases du{" "}
        <span>HTML</span> et du <span>CSS</span> --
      </Prose>

      <Prose>
        -- ce qui n'était au départ qu'une expérimentation ludique est
        vite devenu une <span>passion</span> dévorante --
      </Prose>

      <Prose>
        -- j'ai appris <span>"à la dure"</span>, en passant de sites
        statiques bruts à la complexité de <span>JavaScript</span> --
      </Prose>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="space-y-3 overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            key="about-expanded"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Prose>
              -- j'ai passé des semaines à décortiquer la logique des{" "}
              <span>Promises</span> et de l'asynchrone jusqu'au déclic
              --
            </Prose>

            <Prose>
              -- cette courbe d'apprentissage m'a enseigné une leçon
              précieuse :{" "}
              <i>
                chaque erreur est une opportunité de comprendre le
                "pourquoi" derrière le "comment"
              </i>{" "}
              --
            </Prose>

            <Prose>
              -- c'est cette gratification de voir une idée abstraite
              devenir une réalité interactive qui me motive chaque
              jour --
            </Prose>

            <Prose>
              -- la transition vers l'écosystème moderne a marqué un
              véritable tournant --
            </Prose>

            <Prose>
              -- d'abord sceptique, j'ai rapidement adopté la logique
              modulaire de <span>React</span> et la robustesse de{" "}
              <span>TypeScript</span>, qui ont remplacé la
              manipulation manuelle du <span>DOM</span> et le débogage
              fastidieux par une architecture fiable --
            </Prose>

            <Prose>
              -- l'ajout de <span>Next.js</span> et{" "}
              <span>Tailwind CSS</span> a ensuite décuplé ma
              productivité : fini les configurations lourdes et le CSS
              ingérable --
            </Prose>

            <div className="my-4 space-y-4">
              <Marquee>
                <MarqueeFade side="left" />
                <MarqueeFade side="right" />
                <MarqueeContent direction="left">
                  {CONTENT.map(({ icon: Icon, title }) => (
                    <MarqueeItem key={title}>
                      <Icon />
                      <p className="sr-only">{title}</p>
                    </MarqueeItem>
                  ))}
                </MarqueeContent>
              </Marquee>

              <Marquee>
                <MarqueeFade side="left" />
                <MarqueeFade side="right" />
                <MarqueeContent direction="right">
                  {CONTENT.map(({ icon: Icon, title }) => (
                    <MarqueeItem key={title}>
                      <Icon />
                      <p className="sr-only">{title}</p>
                    </MarqueeItem>
                  ))}
                </MarqueeContent>
              </Marquee>
            </div>

            <Prose>
              -- aujourd'hui, je maîtrise cette stack{" "}
              <i>(Next.js/TS/Tailwind)</i> pour déployer rapidement
              des applications performantes et propres, animé par une
              veille technique constante pour optimiser chaque ligne
              de code --
            </Prose>
          </motion.div>
        )}
      </AnimatePresence>
    </PanelContent>
  )
);
