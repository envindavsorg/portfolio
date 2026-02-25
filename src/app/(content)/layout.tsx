import type React from 'react';
import { Particles } from '@/components/blocks/Particles';
import { Footer } from '@/components/layouts/footer/Footer';
import { NavBar } from '@/components/layouts/navbar/NavBar';

interface AppLayoutProps {
	children: React.ReactNode;
}

const AppLayout = ({ children }: Readonly<AppLayoutProps>) => (
	<>
		<a
			className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-foreground focus:text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2"
			href="#main"
		>
			aller au contenu principal
		</a>

		<NavBar />
		<main className="max-w-screen overflow-x-clip px-2" id="main">
			{children}
		</main>
		<Footer />

		<Particles density={80} />
	</>
);

export default AppLayout;
