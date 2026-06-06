import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import { Prose } from "@/components/primitives/Typography";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { CertItem } from "./CertItem";
import { CERTS } from "./content";

export const Certs = () => (
  <Panel>
    <PanelHeader sticky title={m.home_certs_panel_title()} />

    <PanelContent>
      {getLocale() === "en" ? (
        <>
          <Prose>
            -- technologies <span>evolve</span> fast, and staying up
            to date is essential --
          </Prose>
          <Prose>
            -- these <span>certifications</span> validate{" "}
            <i>my technical skills</i> and demonstrate my commitment
            to <span>excellence</span> and continuous{" "}
            <span>learning</span> in modern web development --
          </Prose>
        </>
      ) : (
        <>
          <Prose>
            -- les technologies <span>évoluent</span> rapidement, et
            rester à jour est essentiel --
          </Prose>
          <Prose>
            -- ces <span>certifications</span> valident{" "}
            <i>mes compétences techniques</i> et démontrent mon
            engagement envers <span>l'excellence</span> et{" "}
            <span>l'apprentissage</span> continu dans le développement
            web moderne --
          </Prose>
        </>
      )}
    </PanelContent>

    {CERTS.map((item, idx) => (
      <CertItem
        cert={item}
        isLast={idx === CERTS.length - 1}
        key={item.credentialID}
      />
    ))}
  </Panel>
);
