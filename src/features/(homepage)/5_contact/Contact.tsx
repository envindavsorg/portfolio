import type React from 'react';
import { getGitHubData } from '@/actions/github/data.action';
import { getFollowersData } from '@/actions/linkedin/followers.action';
import { Panel } from '@/components/ui/Panel';
import { ContactItem } from './ContactItem';
import { SOCIAL_LINKS } from './content';

const Contact = async (): Promise<React.JSX.Element> => {
	const [github, linkedin] = await Promise.all([
		getGitHubData().then((data) => data.followers),
		getFollowersData().then((data) => data.count),
	]);

	return (
		<Panel className="relative py-4">
			<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
				<div className="border-edge border-r" />
				<div className="border-edge border-l" />
			</div>

			<div className="screen-line-before screen-line-after grid grid-cols-1 gap-4 sm:grid-cols-2">
				{SOCIAL_LINKS.map((item) => (
					<div key={item.link}>
						<ContactItem content={item} followers={{ github, linkedin }} />
					</div>
				))}
			</div>
		</Panel>
	);
};

Contact.displayName = 'Contact';

export { Contact };
