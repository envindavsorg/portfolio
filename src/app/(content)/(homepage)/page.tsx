import type { Metadata } from 'next';
import type React from 'react';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Divider } from '@/components/ui/Divider';
import { About } from '@/features/(homepage)/about/About';
import { Articles } from '@/features/(homepage)/articles/Articles';
import { Certifications } from '@/features/(homepage)/certifications/Certifications';
import { Commits } from '@/features/(homepage)/commits/Commits';
import { Contact } from '@/features/(homepage)/contact/Contact';
import { Cover } from '@/features/(homepage)/cover/Cover';
import { CurriculumVitae } from '@/features/(homepage)/cv/CurriculumVitae';
import { Experiences } from '@/features/(homepage)/experiences/Experiences';
import { Header } from '@/features/(homepage)/header/Header';
import { Overview } from '@/features/(homepage)/overview/Overview';
import { Projects } from '@/features/(homepage)/projects/Projects';
import { TechStack } from '@/features/(homepage)/stack/TechStack';
import { Tools } from '@/features/(homepage)/tools/Tools';
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
			<CurriculumVitae />
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
			<CurriculumVitae />
			<Divider border />
		</div>
	</>
);

export default Page;
