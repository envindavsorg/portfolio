import dynamic from 'next/dynamic';
import type React from 'react';
import { Sparkles } from '@/components/animations/Sparkles';
import { getGitHubUserData } from '@/components/features/contact/actions/github.action';
import { Footer } from '@/components/navigation/Footer';
import { NavBar } from '@/components/navigation/NavBar';

const RootContextMenu = dynamic(() =>
	import('@/components/context/RootContextMenu').then(
		(mod) => mod.RootContextMenu,
	),
);

const ScrollTop = dynamic(() =>
	import('@/components/ui/ScrollTop').then((mod) => mod.ScrollTop),
);

export type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout = async ({ children }: Readonly<AppLayoutProps>) => {
	const { branch, commit } = await getGitHubUserData();
	const { hash, date } = commit;

	return (
		<>
			<NavBar />
			<RootContextMenu>
				<main className="max-w-screen overflow-x-hidden px-2">
					{children}
				</main>
			</RootContextMenu>
			<Sparkles density={150} />
			<Footer commit={{ branch, hash, update: date }} />
			<ScrollTop />
		</>
	);
};

export default AppLayout;
