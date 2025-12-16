import type { Metadata } from 'next';
import type { ProfilePage as PageSchema, WithContext } from 'schema-dts';
import { Cover } from '@/components/features/root/cover/Cover';
import { USER } from '@/features/root/data/user';
import { dayjs } from '@/lib/dayjs';
import { openGraphImage } from '@/lib/open-graph';

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
		name: USER.displayName,
		identifier: USER.username,
		image: USER.avatar,
	},
});

const isCapture = process.env.ENV_TYPE === 'capture';

const Page = async () => {
	// const [github, linkedin] = await Promise.all([
	// 	getGitHubUserData().then((data) => data.followers),
	// 	getLinkedInFollowers().then((data) => data.count),
	// ]);
	//
	// const paragraphs = USER.about.trim().split('\n\n');
	// const firstParagraph = paragraphs[0];
	// const restParagraphs = paragraphs.slice(1).join('\n\n');

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(getPageJsonLd()).replace(
						/</g,
						'\\u003c',
					),
				}}
				type="application/ld+json"
			/>

			<div className="mx-auto md:max-w-3xl">
				<Cover capture={isCapture} />
				{/*<Header capture={isCapture} />*/}
				{/*<Divider />*/}
				{/*<Overview />*/}
				{/*<Divider />*/}
				{/*<CV />*/}
				{/*<Divider />*/}
				{/*<Contact*/}
				{/*	capture={isCapture}*/}
				{/*	github={github}*/}
				{/*	linkedin={linkedin}*/}
				{/*/>*/}
				{/*<Divider />*/}
				{/*<About first={firstParagraph} rest={restParagraphs} />*/}
				{/*<Divider />*/}
				{/*<Commits />*/}
				{/*<Divider />*/}
				{/*<TechStack />*/}
				{/*<Divider />*/}
				{/*<Blog />*/}
				{/*<Divider />*/}
				{/*<Certs />*/}
				{/*<Divider />*/}
				{/*<Utils />*/}
				{/*<Divider />*/}
				{/*<Experiences />*/}
				{/*<Divider />*/}
				{/*<CV />*/}
				{/*<Divider />*/}
				{/*<Projects />*/}
				{/*<Divider />*/}
			</div>
		</>
	);
};

export default Page;
