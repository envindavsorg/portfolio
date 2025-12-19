import { CERTIFICATIONS } from '@/components/features/certifications/data/certifications';
import { SOCIAL_LINKS } from '@/components/features/contact/data/social-links';
import { EXPERIENCES } from '@/components/features/experiences/data/experiences';
import { PROJECTS } from '@/components/features/projects/data/projects';
import { techStack } from '@/components/features/stack/data/tech-stack';
import { SITE_INFO } from '@/config/site';
import { USER } from '@/config/user';
import { getLLMText } from '@/lib/blog/llm';
import { getAllPosts } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';

const allPosts: Post[] = getAllPosts();

const aboutText = `
## À propos de moi

${USER.about.trim()}

### Mes informations personnelles

- Prénom: ${USER.firstName}
- Nom: ${USER.lastName}
- Nom d'affichage: ${USER.firstName}
- Ville: ${USER.location.city}
- Site: ${USER.website}

### Réseaux sociaux

${SOCIAL_LINKS.map((item) => `- [${item.title}](${item.href})`).join('\n')}

### Compétences techniques

${techStack.map((item) => `- [${item.title}]`).join('\n')}\n`;

const experienceText = `
## Expériences professionnelles

${EXPERIENCES.map((item) =>
	item.positions
		.map((position) => {
			const skills =
				position.skills?.map((skill) => skill).join(', ') || 'N/A';
			return `### ${position.title} | ${item.companyName}\n\nDurée: ${position.employmentPeriod.start} - ${position.employmentPeriod.end || 'Maintenant'}\n\nCompétences: ${skills}\n\n${position.description?.trim()}`;
		})
		.join('\n\n'),
).join('\n\n')}
`;

const projectsText = `
## Mes projets

${PROJECTS.map((item) => {
	const skills = `\n\nCompétences: ${item.skills.join(', ')}`;
	const description = item.description
		? `\n\n${item.description.trim()}`
		: '';
	return `### ${item.title}\n\nLien du projet: ${item.link}${skills}${description}`;
}).join('\n\n')}
`;

const certificationsText = `
## Certifications obtenues

${CERTIFICATIONS.map((item) => `- [${item.title}](${item.credentialURL})`).join('\n')}`;

const getBlogContent = async () => {
	const text = await Promise.all(
		allPosts.map(
			async (item) =>
				`---\ntitle: "${item.metadata.title}"\ndescription: "${item.metadata.description}"\nlast_updated: "${dayjs(item.metadata.updatedAt).format('dddd DD MMMM YYYY')}"\nsource: "${SITE_INFO.url}/blog/${item.slug}"\n---\n\n${await getLLMText(item)}`,
		),
	);
	return text.join('\n\n');
};

const getContent =
	async () => `<SYSTEM>Ce document contient des informations complètes sur le profil professionnel, le portfolio et le contenu de blog de ${USER.firstName}. Il inclut les détails personnels, l'expérience professionnelle, les projets, les réalisations, les certifications et tous les articles de blog publiés. Ces données sont formatées pour être consommées par les Grands Modèles de Langage (LLMs) afin de fournir des informations précises et à jour sur le parcours, les compétences et l'expertise de ${USER.firstName} en tant que Développeur Full-Stack et Front-End.</SYSTEM>

# cuzeacflorin.fr

> Mon portfolio minimaliste, construit avec React, Next.js et Tailwind.css avec un registre de composants et un blog pour présenter mon travail en tant que développeur front-end.

${aboutText}
${experienceText}
${projectsText}
${certificationsText}

## Mes articles de blog

${await getBlogContent()}`;

export const dynamic = 'force-static';

export const GET = async (): Promise<Response> =>
	new Response(await getContent(), {
		headers: {
			'Content-Type': 'text/markdown;charset=utf-8',
		},
	});
