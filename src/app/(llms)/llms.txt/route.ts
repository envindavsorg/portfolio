import { getAllContent } from "@/lib/content";
import type { Content } from "@/lib/content";

const allPosts: Content[] = getAllContent();

const content = `
# cuzeacflorin.fr

> Mon portfolio minimaliste, construit avec React, Next.js et Tailwind.css avec un registre de composants et un blog pour présenter mon travail en tant que développeur front-end.

- [À propos de moi](https://cuzeacflorin.fr/about.md): Un aperçu de qui je suis, mes compétences et ce que je fais.

- [Mes expériences professionnelles](https://cuzeacflorin.fr/experience.md): Mon parcours professionnel et les rôles que j'ai occupés.

- [Mes projets](https://cuzeacflorin.fr/projects.md): Une sélection de projets sur lesquels j'ai travaillé.

- [Mes certifications](https://cuzeacflorin.fr/certifications.md): Les certifications que j'ai obtenues.

## Blog et registre de composants

Je partage régulièrement des articles sur le développement front-end, les meilleures pratiques, et des tutoriels sur mon blog.

Voici une liste de mes articles récents :

${allPosts.map((item) => `- [${item.metadata.title}](https://cuzeacflorin.fr/blog/${item.slug}.mdx): ${item.metadata.description}`).join("\n")}
`;

export const dynamic = "force-static";

export const GET = async (): Promise<Response> =>
  new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
