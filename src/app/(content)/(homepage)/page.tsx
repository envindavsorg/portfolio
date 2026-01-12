import type { Metadata } from 'next';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { About } from '@/components/features/(homepage)/about/About';
import { Articles } from '@/components/features/(homepage)/articles/Articles';
import { Certifications } from '@/components/features/(homepage)/certifications/Certifications';
import { Commits } from '@/components/features/(homepage)/commits/Commits';
import { CurriculumVitae } from '@/components/features/(homepage)/cv/CurriculumVitae';
import { Experiences } from '@/components/features/(homepage)/experiences/Experiences';
import { Projects } from '@/components/features/(homepage)/projects/Projects';
import { TechStack } from '@/components/features/(homepage)/stack/TechStack';
import { Tools } from '@/components/features/(homepage)/tools/Tools';
import { Divider } from '@/components/ui/Divider';
/*import { Articles } from '@/components/features/Articles';
import { About } from '@/components/features/about/About';
import { Certs } from '@/components/features/certifications/Certs';
import { Commits } from '@/components/features/commits/Commits';
import { getGitHubUserData } from '@/components/features/contact/actions/github.action';
import { getLinkedInFollowers } from '@/components/features/contact/actions/linkedin.action';
import { Contact } from '@/components/features/contact/Contact';
import { Cover } from '@/components/features/cover/Cover';
import { Header } from '@/components/features/Header';
import { Overview } from '@/components/features/Overview';
import { TechStack } from '@/components/features/stack/TechStack';*/
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

// const isCapture = process.env.ENV_TYPE === 'capture';

const Page = async () => {
	/*const [github, linkedin] = await Promise.all([
		getGitHubUserData().then((data) => data.followers),
		getLinkedInFollowers().then((data) => data.count),
	]);*/

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd()).replace(/</g, '\\u003c'),
				}}
				type="application/ld+json"
			/>

			<div className="mx-auto md:max-w-3xl">
				{/*<Cover capture={isCapture} />
				<Header capture={isCapture} />
				<Divider border />
				<Overview />
				<Divider border />
				<CurriculumVitae />
				<Divider border />
				<Contact capture={isCapture} github={github} linkedin={linkedin} />
				<Divider border />

				<Divider border />*/}

				<div className="py-20" />

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
};

export default Page;
