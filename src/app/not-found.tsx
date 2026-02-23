import Link from 'next/link';
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
import { Cover } from '@/features/(root)/cover/Cover';

const NotFound = () => (
	<div className="mx-auto flex h-screen flex-col justify-center md:max-w-3xl">
		<div className="screen-line-after grow border-edge border-x after:-bottom-px">
			<div className="flex h-4" />
		</div>

		<Divider />

		<Cover />

		<Panel>
			<PanelHeader>
				<PanelTitle>
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						Oups, cette page n’existe pas !
					</TextAnimate>
				</PanelTitle>
			</PanelHeader>

			<PanelContent>
				<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
					Peut-être avez-vous cliqué sur un ancien lien ou avez-vous fait une
					faute de frappe ...
				</TextAnimate>

				<TextAnimate
					animation="slideUp"
					as="p"
					by="word"
					className="my-3"
					delay={0.6}
					themed
				>
					Veuillez vérifier l'URL ou revenir à la page d'accueil pour continuer
					votre navigation.
				</TextAnimate>
			</PanelContent>

			<PanelFooter>
				<Button asChild>
					<Link aria-label="Retour en arrière" href="/">
						Retour en arrière
					</Link>
				</Button>
			</PanelFooter>
		</Panel>

		<Divider />

		<div className="screen-line-before grow border-edge border-x after:-bottom-px">
			<div className="flex h-4" />
		</div>
	</div>
);

export default NotFound;
