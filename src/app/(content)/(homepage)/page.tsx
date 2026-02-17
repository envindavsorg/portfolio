import type { Metadata } from 'next';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Divider } from '@/components/ui/Divider';
import GLOBAL_DATA from '@/content/data/global';
import { About } from '@/features/(homepage)/about/About';
import { Articles } from '@/features/(homepage)/articles/Articles';
import { Branding } from '@/features/(homepage)/branding/Branding';
import { Certifications } from '@/features/(homepage)/certifications/Certifications';
import { Commits } from '@/features/(homepage)/commits/Commits';
import { Contact } from '@/features/(homepage)/contact/Contact';
import { Cover } from '@/features/(homepage)/cover/Cover';
import { Cv } from '@/features/(homepage)/cv/Cv';
import { Experiences } from '@/features/(homepage)/experiences/Experiences';
import { Header } from '@/features/(homepage)/header/Header';
import { Overview } from '@/features/(homepage)/overview/Overview';
import { Projects } from '@/features/(homepage)/projects/Projects';
import { TechStack } from '@/features/(homepage)/stack/TechStack';
import { Tools } from '@/features/(homepage)/tools/Tools';
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

		<div className="mx-auto md:max-w-3xl">
			<Cover />
			<Divider />
			<Header />
			<Divider />
			<Overview />
			<Divider />
			<Contact />
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
			<Certifications />
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
