import type React from 'react';
import { getCommitData } from '@/actions/github/commit.action';
import { Particles } from '@/components/animations/Particles';
import { Footer } from '@/components/navigation/Footer';
import { NavBar } from '@/features/(navigation)/navbar/NavBar';
import { getAllPosts } from '@/lib/blog/posts';
import { NAVIGATION_DATA } from '@/lib/navigation';

interface AppLayoutProps {
	children: React.ReactNode;
}

const AppLayout = async ({ children }: Readonly<AppLayoutProps>) => {
	const { branch, hash, updated } = await getCommitData();
	const posts: Post[] = getAllPosts();

	return (
		<>
			<NavBar content={NAVIGATION_DATA} posts={posts} />

			<main className="max-w-screen overflow-x-hidden px-2">{children}</main>

			<Footer branch={branch} hash={hash} updated={updated} />

			<Particles density={150} />
		</>
	);
};

export default AppLayout;
