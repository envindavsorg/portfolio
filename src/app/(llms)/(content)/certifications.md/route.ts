import { CERTIFICATIONS } from '@/components/features/certifications/data/certifications';

const content = `
# Mes certifications

${CERTIFICATIONS.map((item) => `- [${item.title}](${item.credentialURL})`).join('\n')}
`;

export const dynamic = 'force-static';

export const GET = async (): Promise<Response> =>
	new Response(content, {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
