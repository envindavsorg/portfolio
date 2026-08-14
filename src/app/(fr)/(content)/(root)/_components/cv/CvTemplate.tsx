/**
 * `@react-email/components` est DÉPRÉCIÉ en amont, et il n'y a nulle part où aller.
 *
 * Vérifié paquet par paquet : `1.0.12` est la dernière version publiée, et les
 * paquets individuels le sont aussi (`@react-email/html`, `/body`,
 * `/container`, `/heading`… tous « no longer supported »). `react-email@6` n'est
 * pas un remplaçant : c'est l'outil de développement — esbuild, socket.io,
 * chokidar — pas la bibliothèque de composants. Seul `@react-email/render`, qui
 * transforme cet arbre en HTML, reste maintenu, et le dépôt continue de
 * l'utiliser.
 *
 * On garde donc le paquet, sciemment. Les dix composants importés ici ne sont
 * pas de simples alias : `Html` pose la langue, `Head` les métadonnées, `Preview`
 * le pré-en-tête masqué, `Img` les attributs qu'Outlook exige. Les réécrire à la
 * main, c'est reprendre à sa charge la compatibilité des clients de messagerie —
 * et ce site n'a aucun moyen de la tester, faute de clé Resend en CI. Un avis de
 * dépréciation cosmétique ne vaut pas ce risque sur le seul artefact du dépôt
 * qui part par courriel.
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";

import type { AppLocale } from "@/lib/i18n";
import { m } from "@/paraglide/messages";

interface CvTemplateProps {
  firstName: string;
  recipientEmail: string;
  /**
   * Locale transmise explicitement par le formulaire.
   *
   * `getLocale()` ne convient pas ici : l'action serveur s'exécute hors du
   * rendu de la page, donc sans le contexte de locale posé par RootDocument —
   * elle retomberait toujours sur le français.
   */
  locale?: AppLocale;
}

const main = {
  backgroundColor: "#FAF9F6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  maxWidth: "560px",
  padding: "20px 0 48px",
};

const logo = {
  borderRadius: 21,
  height: 42,
  width: 42,
};

const heading = {
  color: "#141413",
  fontSize: "24px",
  fontWeight: "400",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  padding: "17px 0 0",
};

const paragraph = {
  color: "#141413",
  fontSize: "15px",
  lineHeight: "1.4",
  margin: "0 0 15px",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "26px 0 26px",
};

const reportLink = {
  color: "#b4becc",
  fontSize: "14px",
};

export const CvTemplate = ({
  firstName,
  locale = "fr",
}: CvTemplateProps) => (
  <Html>
    <Head />

    <Body style={main}>
      <Preview>CV - Cuzeac Florin | cuzeacflorin.fr</Preview>

      <Container style={container}>
        <Img
          alt="Cuzeac Florin | cuzeacflorin.fr"
          height="42"
          src="https://cuzeacflorin.fr/images/github.webp"
          style={logo}
          width="42"
        />

        <Heading style={heading}>
          {m.home_cv_email_heading({ firstName }, { locale })}
        </Heading>

        <Text style={paragraph}>
          {m.home_cv_email_body({}, { locale })}
        </Text>

        <Hr style={hr} />

        <Link href="https://cuzeacflorin.fr" style={reportLink}>
          Cuzeac Florin | cuzeacflorin.fr
        </Link>
      </Container>
    </Body>
  </Html>
);
