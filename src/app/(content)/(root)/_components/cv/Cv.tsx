import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";

import { CvFooter } from "./CvFooter";

export const Cv = () => (
  <Panel>
    <PanelHeader sticky title="découvrez mon CV" />

    <PanelContent>
      <Prose>
        -- découvrez mon parcours professionnel à travers mon CV
        détaillé, qui retrace mes <i>expériences</i>,{" "}
        <i>compétences techniques</i> et <i>réalisations</i> dans le
        développement web full-stack --
      </Prose>
      <Prose>
        -- pour recevoir une <span>copie actualisée</span> directement
        dans votre boîte e-mail, cliquez sur le bouton ci-dessous --
      </Prose>
      <Prose>
        -- je serai ravi d'échanger avec vous sur d'éventuelles{" "}
        <span>opportunités</span> de collaboration --
      </Prose>
    </PanelContent>

    <CvFooter />
  </Panel>
);
