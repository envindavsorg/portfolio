import { EXPERIENCES } from '@/components/features/(homepage)/experiences/data/experiences';

const content = `
# Mes expériences professionnelles

${EXPERIENCES.map((item) =>
	item.positions
		.map((position) => {
			const skills = position.skills?.map((skill) => skill).join(', ') || 'N/A';
			return `## ${position.title} | ${item.companyName}\n\nDurée: ${position.employmentPeriod.start} - ${position.employmentPeriod.end || 'Maintenant'}\n\nCompétences: ${skills}\n\n${position.description?.trim()}`;
		})
		.join('\n\n')
).join('\n\n')}
`;

export const dynamic = 'force-static';

export const GET = async (): Promise<Response> =>
	new Response(content, {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
