import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import type { JSX } from 'react';
import GLOBAL_DATA from '@/content/data/global';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const FONT_PATH = join(dirname(fileURLToPath(import.meta.url)), 'fonts');

const PAGE_BADGES = {
	homepage: "Page d'accueil",
	blog: 'Blog',
	blogArticle: 'Article de blog',
	components: 'Composants',
	componentsArticle: 'Composant',
	utils: 'Outils',
	utilsArticle: 'Outil',
} as const;

type PageType = keyof typeof PAGE_BADGES;

const isValidPageType = (value: string): value is PageType => {
	return value in PAGE_BADGES;
};

let fontCache: Buffer | null = null;

const loadFont = async (): Promise<Buffer> => {
	if (fontCache) {
		return fontCache;
	}

	fontCache = await readFile(join(FONT_PATH, 'GeistPixel-Square.ttf'));
	return fontCache;
};

const getBadge = (type: PageType): string => {
	if (type === 'homepage') {
		return PAGE_BADGES.homepage;
	}
	return `portfolio | ${GLOBAL_DATA.USER.fullName} | ${PAGE_BADGES[type].toLowerCase()}`;
};

const OG_DIMENSIONS = { width: 1200, height: 630 } as const;

const renderLayout = (
	content: JSX.Element,
	fontFamily = 'sans-serif'
): JSX.Element => (
	<div
		style={{
			position: 'relative',
			height: '100%',
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'flex-start',
			justifyContent: 'space-between',
			background: '#FAF9F6',
			padding: '60px 60px 40px 60px',
			fontFamily,
		}}
	>
		<img
			alt="Cuzeac Florin"
			height={300}
			src="https://cuzeacflorin.fr/images/og-banner.png"
			style={{
				position: 'absolute',
				bottom: '-10%',
				left: '-5%',
				objectFit: 'contain',
				borderRadius: 20,
			}}
			width={1000}
		/>

		{content}

		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				fontSize: 24,
				color: '#141413',
			}}
		>
			<div
				style={{
					width: 8,
					height: 8,
					borderRadius: '50%',
					background: '#00C950',
					marginRight: 12,
				}}
			/>
			{GLOBAL_DATA.SOCIAL.portfolio} -
			<span
				style={{
					color: '#71717B',
					marginLeft: 12,
					textTransform: 'lowercase',
				}}
			>
				{GLOBAL_DATA.WORK.title}
			</span>
		</div>
	</div>
);

export const GET = async (req: NextRequest) => {
	try {
		const { searchParams } = req.nextUrl;

		const rawType = searchParams.get('type') ?? 'homepage';
		const type: PageType = isValidPageType(rawType) ? rawType : 'homepage';
		const title = searchParams.get('title') || GLOBAL_DATA.USER.fullName;
		const description = searchParams.get('description') || GLOBAL_DATA.USER.bio;

		const font = await loadFont();
		const badge = getBadge(type);

		const response = new ImageResponse(
			renderLayout(
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div
						style={{
							display: 'flex',
							alignSelf: 'flex-start',
							borderRadius: 10,
							padding: '8px 16px',
							fontSize: 20,
							fontWeight: 400,
							color: '#141413',
							marginBottom: 40,
							border: '1px solid #141413',
						}}
					>
						{badge}
					</div>
					<div
						style={{
							fontSize: 58,
							fontWeight: 400,
							color: '#141413',
							lineHeight: 1.1,
							marginBottom: 20,
							maxWidth: 1000,
							textTransform: 'lowercase',
						}}
					>
						{title}
					</div>
					<div
						style={{
							fontSize: 30,
							fontWeight: 400,
							color: '#141413',
							maxWidth: 900,
							textTransform: 'lowercase',
						}}
					>
						{description}
					</div>
				</div>,
				'Geist Pixel'
			),
			{
				...OG_DIMENSIONS,
				fonts: [
					{
						name: 'Geist Pixel',
						data: font,
						style: 'normal',
						weight: 400,
					},
				],
			}
		);

		response.headers.set(
			'Cache-Control',
			'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
		);

		return response;
	} catch (error) {
		logger.error('Error generating OG image:', error);

		return new ImageResponse(
			renderLayout(
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div
						style={{
							fontSize: 58,
							fontWeight: 400,
							color: '#E11D48',
							lineHeight: 1.1,
							marginBottom: 20,
							maxWidth: 1000,
							textTransform: 'lowercase',
						}}
					>
						oups ...
					</div>
					<div
						style={{
							fontSize: 30,
							fontWeight: 400,
							color: '#F43F5E',
							maxWidth: 900,
							textTransform: 'lowercase',
						}}
					>
						une erreur est survenue !
					</div>
				</div>
			),
			OG_DIMENSIONS
		);
	}
};
