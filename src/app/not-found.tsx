import Link from 'next/link';
import { Particles } from '@/components/animations/Particles';
import { Button } from '@/components/buttons/Button';
import { Divider } from '@/components/primitives/Divider';
import {
	Panel,
	PanelContent,
	PanelFooter,
	PanelHeader,
	PanelTitle,
} from '@/components/primitives/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';

const NotFound = () => (
	<div className="mx-auto flex h-screen flex-col justify-center md:max-w-3xl">
		<Divider border={false} type="half" />

		<Panel>
			<PanelHeader>
				<PanelTitle>
					<TextAnimate
						animation="slideLeft"
						by="character"
						className="text-4xl! sm:text-5xl!"
						delay={0.2}
					>
						oups, page perdue !
					</TextAnimate>
				</PanelTitle>
			</PanelHeader>

			<Divider before={false} border={false} type="half" />

			<PanelContent>
				<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
					Peut-être avez-vous cliqué sur un ancien lien ou avez-vous fait une
					faute de frappe ...
				</TextAnimate>

				<Divider border={false} type="half" />

				<TextAnimate animation="slideUp" as="p" by="word" delay={0.6} themed>
					Veuillez vérifier l'URL ou revenir à la page d'accueil pour continuer
					votre navigation.
				</TextAnimate>
			</PanelContent>

			<PanelFooter>
				<Button asChild variant="outline">
					<Link aria-label="Retour en arrière" href="/">
						Revenir en arrière ...
					</Link>
				</Button>
			</PanelFooter>
		</Panel>

		<Divider border={false} type="half" />

		<Particles density={150} />
	</div>
);

export default NotFound;
