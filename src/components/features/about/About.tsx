import type React from 'react';
import { Markdown } from '@/components/blog/markdown/markdown';
import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { USER } from '@/config/user';
import { AboutExpandable } from './AboutExpandable';

export const About = (): React.JSX.Element => {
	const content = USER.about.trim();
	const parts = content.split('\n\n');

	const introText = parts[0];
	const restText = parts.length > 1 ? parts.slice(1).join('\n\n') : null;

	return (
		<Panel id="about">
			<PanelHeader>
				<PanelTitle>Quelques mots sur moi</PanelTitle>
			</PanelHeader>

			<PanelContent className="pb-0">
				<Prose>
					<AboutExpandable
						intro={<Markdown>{introText}</Markdown>}
						moreContent={
							restText ? <Markdown>{restText}</Markdown> : null
						}
					/>
				</Prose>
			</PanelContent>
		</Panel>
	);
};
