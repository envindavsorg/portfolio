import type { Metadata } from 'next';
import type React from 'react';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Divider } from '@/components/ui/Divider';
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
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';
import { USER } from '@/lib/user';

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

const getPageJsonLd = (): WithContext<PageSchema> => ({
	'@context': 'https://schema.org',
	'@type': 'ProfilePage',
	dateCreated: dayjs(USER.dateCreated).toISOString(),
	dateModified: dayjs().toISOString(),
	mainEntity: {
		'@type': 'Person',
		name: USER.firstName,
		identifier: USER.username,
		image: USER.avatar,
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
			<Cv />
			<Divider border />
		</div>
	</>
);

export default Page;
