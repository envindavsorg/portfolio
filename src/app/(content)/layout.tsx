import dynamic from 'next/dynamic';
import type React from 'react';
import { getCommitData } from '@/actions/github/commit.action';
import { Sparkles } from '@/components/animations/Sparkles';
import { Footer } from '@/components/navigation/Footer';
import { NavBar } from '@/components/navigation/navbar/NavBar';
import { getAllPosts } from '@/lib/blog/posts';

const RootContextMenu = dynamic(() =>
	import('@/components/context/RootContextMenu').then((mod) => mod.RootContextMenu)
);

const ScrollTop = dynamic(() => import('@/components/ui/ScrollTop').then((mod) => mod.ScrollTop));

export interface AppLayoutProps {
	children: React.ReactNode;
}

const AppLayout = async ({ children }: Readonly<AppLayoutProps>) => {
	const { branch, hash, updated } = await getCommitData();
	const posts = getAllPosts();

	return (
		<>
			<NavBar posts={posts} />
			<RootContextMenu>
				<main className="max-w-screen overflow-x-hidden px-2">{children}</main>
			</RootContextMenu>
			<Sparkles density={150} />
			<Footer branch={branch} hash={hash} updated={updated} />
			<ScrollTop />
		</>
	);
};

export default AppLayout;
