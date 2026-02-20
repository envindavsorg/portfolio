import { getGitHubData } from '@/actions/github/data.action';
import { getFollowersData } from '@/actions/linkedin/followers.action';
import { Panel } from '@/components/primitives/Panel';
import { ContactContent } from './ContactContent';

export const Contact = async () => {
	const [github, linkedin] = await Promise.all([
		getGitHubData().then((data) => data.followers),
		getFollowersData().then((data) => data.count),
	]);

	return (
		<Panel>
			<ContactContent githubFollowers={github} linkedinFollowers={linkedin} />
		</Panel>
	);
};
