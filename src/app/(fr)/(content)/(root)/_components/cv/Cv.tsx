import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import { Prose } from "@/components/primitives/Typography";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { CvFooter } from "./CvFooter";

export const Cv = () => (
  <Panel>
    <PanelHeader sticky title={m.home_cv_panel_title()} />

    <PanelContent>
      {getLocale() === "en" ? (
        <>
          <Prose>
            -- discover my professional background through my detailed
            resume, which traces my <i>experiences</i>,{" "}
            <i>technical skills</i> and <i>achievements</i> in
            full-stack web development --
          </Prose>
          <Prose>
            -- to receive an <span>up-to-date copy</span> directly in
            your inbox, click the button below --
          </Prose>
          <Prose>
            -- i'd be glad to talk with you about any collaboration{" "}
            <span>opportunities</span> --
          </Prose>
        </>
      ) : (
        <>
          <Prose>
            -- découvrez mon parcours professionnel à travers mon CV
            détaillé, qui retrace mes <i>expériences</i>,{" "}
            <i>compétences techniques</i> et <i>réalisations</i> dans
            le développement web full-stack --
          </Prose>
          <Prose>
            -- pour recevoir une <span>copie actualisée</span>{" "}
            directement dans votre boîte e-mail, cliquez sur le bouton
            ci-dessous --
          </Prose>
          <Prose>
            -- je serai ravi d'échanger avec vous sur d'éventuelles{" "}
            <span>opportunités</span> de collaboration --
          </Prose>
        </>
      )}
    </PanelContent>

    <CvFooter />
  </Panel>
);
