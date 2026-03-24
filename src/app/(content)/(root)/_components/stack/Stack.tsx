import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";

import { STACK_ICONS } from "./content";
import { StackContent } from "./StackContent";

export const TechStack = () => (
  <Panel>
    <PanelHeader sticky title="ma stack technique" />

    <PanelContent>
      <Prose>
        -- développeur full-stack spécialisé dans l'écosystème{" "}
        <span>JavaScript</span> moderne — de la conception{" "}
        <span>Figma</span> au déploiement, en passant par{" "}
        <span>React</span>, <span>Next.js</span>,{" "}
        <span>TypeScript</span> côté front et <span>Node.js</span>,{" "}
        <span>Express</span>, <span>Fastify</span> côté back, avec{" "}
        <span>MongoDB</span> ou <span>PostgreSQL</span> --
      </Prose>
    </PanelContent>

    <StackContent content={STACK_ICONS} />
  </Panel>
);
