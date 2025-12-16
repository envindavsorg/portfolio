import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { Markdown } from '@/features/blog/markdown/markdown';
import { ToggleContent } from './elements/ToggleContent';

type AboutProps = {
	first: string;
	rest: string;
};

export const About = ({ first, rest }: Readonly<AboutProps>) => (
	<Panel id="about">
		<PanelHeader>
			<PanelTitle>Quelques mots sur moi</PanelTitle>
		</PanelHeader>

		<PanelContent>
			<Prose className="text-muted-foreground">
				<Markdown>{first}</Markdown>
				<ToggleContent>
					<Markdown>{rest}</Markdown>
				</ToggleContent>
			</Prose>
		</PanelContent>
	</Panel>
);
