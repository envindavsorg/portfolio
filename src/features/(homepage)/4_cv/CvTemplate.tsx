import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Text } from '@react-email/components';

interface CvTemplateProps {
	firstName: string;
	recipientEmail: string;
}

const CvTemplate = ({ firstName }: CvTemplateProps) => (
	<Html>
		<Head />

		<Body style={main}>
			<Preview>CV - Cuzeac Florin | cuzeacflorin.fr</Preview>

			<Container style={container}>
				<Img
					alt="Cuzeac Florin | cuzeacflorin.fr"
					height="42"
					src="https://cuzeacflorin.fr/emails/logo.png"
					style={logo}
					width="42"
				/>

				<Heading style={heading}>Bonjour {firstName} !</Heading>

				<Text style={paragraph}>
					Merci de votre intérêt pour mon profil. Vous trouverez en pièce jointe mon CV au format PDF. N'hésitez pas à
					me contacter si vous avez des questions.
				</Text>

				<Hr style={hr} />

				<Link href="https://cuzeacflorin.fr" style={reportLink}>
					Cuzeac Florin | cuzeacflorin.fr
				</Link>
			</Container>
		</Body>
	</Html>
);

const main = {
	backgroundColor: '#FAF9F6',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: '0 auto',
	padding: '20px 0 48px',
	maxWidth: '560px',
};

const logo = {
	borderRadius: 21,
	width: 42,
	height: 42,
};

const heading = {
	fontSize: '24px',
	letterSpacing: '-0.5px',
	lineHeight: '1.3',
	fontWeight: '400',
	color: '#141413',
	padding: '17px 0 0',
};

const paragraph = {
	margin: '0 0 15px',
	fontSize: '15px',
	lineHeight: '1.4',
	color: '#141413',
};

const hr = {
	borderColor: '#dfe1e4',
	margin: '26px 0 26px',
};

const reportLink = {
	fontSize: '14px',
	color: '#b4becc',
};

CvTemplate.displayName = 'CurriculumVitaeTemplate';

export { CvTemplate };
