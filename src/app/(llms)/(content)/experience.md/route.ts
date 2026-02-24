import { EXPERIENCES } from '@/app/(content)/(root)/_components/experiences/content';

const content = `
# Mes expériences professionnelles

${EXPERIENCES.map((item) => {
	const skills = item.skills?.join(', ') || 'N/A';
	const description = Array.isArray(item.description)
		? item.description.map((desc) => `- ${desc}`).join('\n')
		: item.description || '';
	const period = `${item.period.start} - ${item.period.end || 'Maintenant'}`;

	return `## ${item.title} | ${item.company}

**Durée:** ${period}${item.type ? ` | **Type:** ${item.type}` : ''}${item.link ? `\n**Lien:** ${item.link}` : ''}

**Compétences:** ${skills}

${description}`;
}).join('\n\n---\n\n')}
`;

export const dynamic = 'force-static';

export const GET = async (): Promise<Response> =>
	new Response(content, {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
