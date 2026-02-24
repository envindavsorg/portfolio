import type React from 'react';
import { Particles } from '@/components/blocks/Particles';
import { Footer } from '@/components/layouts/footer/Footer';
import { NavBar } from '@/components/layouts/navbar/NavBar';

interface AppLayoutProps {
	children: React.ReactNode;
}

const AppLayout = ({ children }: Readonly<AppLayoutProps>) => (
	<>
		<NavBar />
		<main className="max-w-screen overflow-x-clip px-2">{children}</main>
		<Footer />

		<Particles density={150} />
	</>
);

export default AppLayout;
