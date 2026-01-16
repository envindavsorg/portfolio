import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import GLOBAL_DATA from '@/content/data/global';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

type PageType = 'homepage' | 'blog' | 'blogArticle' | 'components' | 'componentsArticle' | 'utils' | 'utilsArticle';

export const GET = async (req: NextRequest) => {
	try {
		const { searchParams } = req.nextUrl;

		const type = (searchParams.get('type') as PageType) || 'homepage';
		const title = searchParams.get('title') || `${GLOBAL_DATA.USER.fullName}`;
		const description = searchParams.get('description') || GLOBAL_DATA.USER.bio;

		const getTypeStyles = (pageType: PageType) => {
			const baseStyles = {
				homepage: {
					badge: "Page d'accueil",
				},
				blog: {
					badge: `Portfolio | ${GLOBAL_DATA.USER.fullName} | Blog`,
				},
				blogArticle: {
					badge: `Portfolio | ${GLOBAL_DATA.USER.fullName} | Article de blog`,
				},
				components: {
					badge: `Portfolio | ${GLOBAL_DATA.USER.fullName} | Composants`,
				},
				componentsArticle: {
					badge: `Portfolio | ${GLOBAL_DATA.USER.fullName} | Composant`,
				},
				utils: {
					badge: `Portfolio | ${GLOBAL_DATA.USER.fullName} | Outils`,
				},
				utilsArticle: {
					badge: `Portfolio | ${GLOBAL_DATA.USER.fullName} | Outil`,
				},
			};
			return baseStyles[pageType] || baseStyles.homepage;
		};

		const styles = getTypeStyles(type);

		const fontPath = join(process.cwd(), 'src', 'assets', 'fonts');
		const [fontRegular, fontMedium, fontBold] = await Promise.all([
			readFile(join(fontPath, 'Geist-Regular.ttf')),
			readFile(join(fontPath, 'Geist-Medium.ttf')),
			readFile(join(fontPath, 'Geist-Bold.ttf')),
		]);

		return new ImageResponse(
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
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					padding: '60px 60px 40px 60px',
					fontFamily: 'Geist Sans',
				}}
			>
				<img
					alt="Element"
					height="300px"
					src="https://cuzeacflorin.fr/images/og-banner.png"
					style={{
						position: 'absolute',
						bottom: '-10%',
						left: '-5%',
						objectFit: 'contain',
						borderRadius: '20px',
					}}
					width="1000px"
				/>

				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div
						style={{
							width: '100%',
							borderRadius: '10px',
							padding: '8px 16px',
							fontSize: '20px',
							fontWeight: '600',
							color: '#141413',
							marginBottom: '40px',
							border: '1px solid #141413',
						}}
					>
						{styles.badge}
					</div>
					<div
						style={{
							fontSize: '58px',
							fontWeight: '800',
							color: '#141413',
							lineHeight: '1.1',
							marginBottom: '20px',
							maxWidth: '1000px',
						}}
					>
						{title}
					</div>
					<div
						style={{
							fontSize: '30px',
							fontWeight: '400',
							color: '#141413',
							maxWidth: '900px',
						}}
					>
						{description}
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						fontSize: '24px',
						color: '#141413',
					}}
				>
					<div
						style={{
							width: '8px',
							height: '8px',
							borderRadius: '50%',
							background: '#00C950',
							marginRight: '12px',
						}}
					/>
					{GLOBAL_DATA.SOCIAL.portfolio} -{' '}
					<span
						style={{
							color: '#71717B',
							marginLeft: '12px',
						}}
					>
						{GLOBAL_DATA.WORK.title}
					</span>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: 'Geist Sans',
						data: fontRegular,
						style: 'normal',
						weight: 400,
					},
					{
						name: 'Geist Sans',
						data: fontMedium,
						style: 'normal',
						weight: 600,
					},
					{
						name: 'Geist Sans',
						data: fontBold,
						style: 'normal',
						weight: 800,
					},
				],
			}
		);
	} catch (error) {
		logger.error('Error generating OG image:', error);

		return new ImageResponse(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					color: 'white',
					fontSize: '48px',
					fontWeight: 'bold',
				}}
			>
				Something went wrong
			</div>,
			{ width: 1200, height: 630 }
		);
	}
};
