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

interface CvTemplateProps {
  firstName: string;
  recipientEmail: string;
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

export const CvTemplate = ({ firstName }: CvTemplateProps) => (
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

        <Heading style={heading}>Bonjour {firstName} !</Heading>

        <Text style={paragraph}>
          Merci de votre intérêt pour mon profil. Vous trouverez en
          pièce jointe mon CV au format PDF. N'hésitez pas à me
          contacter si vous avez des questions.
        </Text>

        <Hr style={hr} />

        <Link href="https://cuzeacflorin.fr" style={reportLink}>
          Cuzeac Florin | cuzeacflorin.fr
        </Link>
      </Container>
    </Body>
  </Html>
);
