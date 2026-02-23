import type { Metadata } from 'next';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Divider } from '@/components/primitives/Divider';
import GLOBAL_DATA from '@/content/data/global';
import { About } from '@/features/(root)/about/About';
import { Articles } from '@/features/(root)/articles/Articles';
import { Branding } from '@/features/(root)/branding/Branding';
import { Certs } from '@/features/(root)/certs/Certs';
import { Commits } from '@/features/(root)/commits/Commits';
import { Cover } from '@/features/(root)/cover/Cover';
import { Cv } from '@/features/(root)/cv/Cv';
import { Experiences } from '@/features/(root)/experiences/Experiences';
import { Header } from '@/features/(root)/header/Header';
import { Overview } from '@/features/(root)/overview/Overview';
import { Projects } from '@/features/(root)/projects/Projects';
import { TechStack } from '@/features/(root)/stack/Stack';
import { Tools } from '@/features/(root)/tools/Tools';
import { openGraphImage } from '@/lib/open-graph';
import { dayjs } from '@/lib/utils';

export const generateMetadata = async (): Promise<Metadata> =>
	openGraphImage({
		title: GLOBAL_DATA.USER.fullName,
		description: GLOBAL_DATA.USER.bio,
		ogImageParams: {
			type: 'homepage',
			title: GLOBAL_DATA.USER.fullName,
			description: GLOBAL_DATA.USER.bio,
		},
	});

const getPageJsonLd = (): WithContext<PageSchema> => ({
	'@context': 'https://schema.org',
	'@type': 'ProfilePage',
	dateCreated: dayjs('2025-09-01').toISOString(),
	dateModified: dayjs().toISOString(),
	mainEntity: {
		'@type': 'Person',
		name: GLOBAL_DATA.USER.firstName,
		identifier: GLOBAL_DATA.USER.username,
		image: GLOBAL_DATA.USER.avatar,
	},
});

const Page = () => (
	<>
		<script
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(getPageJsonLd()).replace(/</g, '\\u003c'),
			}}
			type="application/ld+json"
		/>

		<div className="relative mx-auto md:max-w-3xl">
			<Cover />
			<Divider />
			<Header />
			<Divider />
			<Overview />
			<Divider />
			<Cv />
			<Divider />
			<About />
			<Divider />
			<Commits />
			<Divider />
			<TechStack />
			<Divider />
			<Articles />
			<Divider />
			<Certs />
			<Divider />
			<Tools />
			<Divider />
			<Experiences />
			<Divider />
			<Projects />
			<Divider />
			<Branding />
			<Divider />
			<Cv />
			<Divider />
		</div>
	</>
);

export default Page;
