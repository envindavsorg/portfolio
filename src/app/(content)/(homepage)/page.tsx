import type { Metadata } from 'next';
import type React from 'react';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Divider } from '@/components/ui/Divider';
import GLOBAL_DATA from '@/content/data/global';
import { Cover } from '@/features/(homepage)/1_cover/Cover';
import { Header } from '@/features/(homepage)/2_header/Header';
import { Overview } from '@/features/(homepage)/3_overview/Overview';
import { Cv } from '@/features/(homepage)/4_cv/Cv';
import { Contact } from '@/features/(homepage)/5_contact/Contact';
import { About } from '@/features/(homepage)/6_about/About';
import { Commits } from '@/features/(homepage)/7_commits/Commits';
import { TechStack } from '@/features/(homepage)/8_stack/TechStack';
import { Articles } from '@/features/(homepage)/9_articles/Articles';
import { Certifications } from '@/features/(homepage)/10_certifications/Certifications';
import { Tools } from '@/features/(homepage)/11_tools/Tools';
import { Experiences } from '@/features/(homepage)/12_experiences/Experiences';
import { Projects } from '@/features/(homepage)/13_projects/Projects';
import { Branding } from '@/features/(homepage)/14_branding/Branding';
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

const Page = (): React.JSX.Element => (
	<>
		<script
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(getPageJsonLd()).replace(/</g, '\\u003c'),
			}}
			type="application/ld+json"
		/>

		<div className="mx-auto md:max-w-3xl">
			<Cover />
			<Header />
			<Divider border />
			<Overview />
			<Divider border />
			<Cv />
			<Divider border />
			<Contact />
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
			<Divider border />
		</div>
	</>
);

export default Page;
