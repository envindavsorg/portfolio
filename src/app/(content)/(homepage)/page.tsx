import type { Metadata } from 'next';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Divider } from '@/components/ui/Divider';
import GLOBAL_DATA from '@/content/data/global';
import { About } from '@/features/(homepage)/about/About';
import { Contact } from '@/features/(homepage)/contact/Contact';
import { Cover } from '@/features/(homepage)/cover/Cover';
import { Cv } from '@/features/(homepage)/cv/Cv';
import { Header } from '@/features/(homepage)/header/Header';
import { Overview } from '@/features/(homepage)/overview/Overview';
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

			{/*

			<Divider border />

			<About />
			<Divider border />
			<Commits />
			<Divider border />
			<TechStack />
			<Divider border />
			<Articles />
			<Divider border />
			<Certifications />
			<Divider border />
			<Tools />
			<Divider border />
			<Experiences />
			<Divider border />
			<Projects />
			<Divider border />
			<Branding />
			<Divider border />
			<Cv />
			<Divider border />*/}
		</div>
	</>
);

export default Page;
