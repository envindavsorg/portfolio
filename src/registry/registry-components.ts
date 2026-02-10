import type { Registry } from 'shadcn/schema';

export const components: Registry['items'] = [
	{
		name: 'theme-switcher',
		type: 'registry:component',
		description:
			'Un composant de sélection de thème pour les applications Next.js avec next-themes et Tailwind CSS, supportant les modes système, clair et sombre.',
		title: 'Theme Switcher',
		author: 'envindavsorg <contact@cuzeacflorin.fr>',
		dependencies: ['next-themes', '@phosphor-icons/react', 'motion'],
		registryDependencies: ['@envindavsorg/utils'],
		files: [
			{
				path: 'theme-switcher/ThemeSwitcher.tsx',
				type: 'registry:component',
			},
		],
		docs: 'https://cuzeacflorin.fr/components/theme-switcher-component',
	},
	{
		name: 'apple-hello-effect',
		type: 'registry:component',
		description:
			"Créez un effet d'écriture Bonjour, Hello et Hola inspiré d'Apple en utilisant motion/react.",
		title: 'Apple Hello Effect',
		author: 'envindavsorg <contact@cuzeacflorin.fr>',
		dependencies: ['motion'],
		registryDependencies: ['@envindavsorg/utils'],
		files: [
			{
				path: 'apple-hello-effect/AppleHelloEffect.tsx',
				type: 'registry:component',
			},
		],
		docs: 'https://cuzeacflorin.fr/components/writing-effect-inspired-by-apple',
	},
	{
		name: 'flip-sentences',
		type: 'registry:component',
		description:
			'Un composant React animé avec motion/react qui fait défiler automatiquement une liste de phrases avec une transition fluide.',
		title: 'Flip Sentences',
		author: 'envindavsorg <contact@cuzeacflorin.fr>',
		dependencies: ['motion'],
		registryDependencies: ['@envindavsorg/utils'],
		files: [
			{
				path: 'flip-sentences/FlipSentences.tsx',
				type: 'registry:component',
			},
		],
		docs: 'https://cuzeacflorin.fr/components/flip-sentences',
	},
];
