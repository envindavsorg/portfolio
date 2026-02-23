import { PROJECTS } from '@/features/(root)/projects/content';

const content = `# Projects

${PROJECTS.map((item) => {
	const skills = `\n\nCompétences: ${item.skills.join(', ')}`;
	const description = item.description ? `\n\n${item.description}` : '';
	return `## ${item.title}\n\nLien du projet: ${item.link}${skills}${description}`;
}).join('\n\n')}
`;

export const dynamic = 'force-static';

export const GET = async (): Promise<Response> =>
	new Response(content, {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
