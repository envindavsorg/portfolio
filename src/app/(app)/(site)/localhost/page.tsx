import type { Metadata } from 'next';
import { Prose } from '@/components/ui/Typography';
import { USER } from '@/content/user';
import { openGraphImage } from '@/lib/open-graph';
import { Localhost } from './components/Localhost';
import { metadata } from './metadata';

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title: `${USER.firstName} ${USER.lastName}`,
		description: USER.bio,
		ogImageParams: {
			type: 'homepage',
			title: `${USER.firstName} ${USER.lastName}`,
			description: USER.bio,
		},
	});

const Page = () => (
	<div className="min-h-svh">
		<div className="screen-line-after px-4">
			<h1 className="font-semibold text-3xl sm:text-4xl">
				{metadata.title}
			</h1>
		</div>

		<div className="p-4">
			<Prose>{metadata.description}</Prose>
		</div>

		<Localhost />
	</div>
);

export default Page;
