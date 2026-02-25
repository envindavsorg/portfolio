import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Articles } from '@/app/(content)/(root)/_components/articles/Articles';
import { Branding } from '@/app/(content)/(root)/_components/branding/Branding';
import { Certs } from '@/app/(content)/(root)/_components/certs/Certs';
import { Commits } from '@/app/(content)/(root)/_components/commits/Commits';
import { Cover } from '@/app/(content)/(root)/_components/cover/Cover';
import { Cv } from '@/app/(content)/(root)/_components/cv/Cv';
import { Experiences } from '@/app/(content)/(root)/_components/experiences/Experiences';
import { Header } from '@/app/(content)/(root)/_components/header/Header';
import { Overview } from '@/app/(content)/(root)/_components/overview/Overview';
import { Projects } from '@/app/(content)/(root)/_components/projects/Projects';
import { TechStack } from '@/app/(content)/(root)/_components/stack/Stack';
import { Tools } from '@/app/(content)/(root)/_components/tools/Tools';
import { Divider } from '@/components/primitives/Divider';
import GLOBAL_DATA from '@/data/global';
import { dayjs } from '@/lib/functions';
import { buildContentMetadata } from '@/lib/open-graph';

const About = dynamic(() =>
	import('@/app/(content)/(root)/_components/about/About').then(
		(mod) => mod.About
	)
);

export const revalidate = 3600;

export const generateMetadata = async (): Promise<Metadata> =>
	buildContentMetadata({
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
			<Suspense>
				<Commits />
			</Suspense>
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
