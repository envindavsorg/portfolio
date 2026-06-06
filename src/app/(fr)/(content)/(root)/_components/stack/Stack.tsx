import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import { Prose } from "@/components/primitives/Typography";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { STACK_ICONS } from "./content";
import { StackContent } from "./StackContent";

export const TechStack = () => (
  <Panel>
    <PanelHeader sticky title={m.home_stack_panel_title()} />

    <PanelContent>
      {getLocale() === "en" ? (
        <Prose>
          -- full-stack developer specialized in the modern{" "}
          <span>JavaScript</span> ecosystem — from <span>Figma</span>{" "}
          design to deployment, through <span>React</span>,{" "}
          <span>Next.js</span>, <span>TypeScript</span> on the front
          and <span>Node.js</span>, <span>Express</span>,{" "}
          <span>Fastify</span> on the back, with <span>MongoDB</span>{" "}
          or <span>PostgreSQL</span> --
        </Prose>
      ) : (
        <Prose>
          -- développeur full-stack spécialisé dans l'écosystème{" "}
          <span>JavaScript</span> moderne — de la conception{" "}
          <span>Figma</span> au déploiement, en passant par{" "}
          <span>React</span>, <span>Next.js</span>,{" "}
          <span>TypeScript</span> côté front et <span>Node.js</span>,{" "}
          <span>Express</span>, <span>Fastify</span> côté back, avec{" "}
          <span>MongoDB</span> ou <span>PostgreSQL</span> --
        </Prose>
      )}
    </PanelContent>

    <StackContent content={STACK_ICONS} />
  </Panel>
);
