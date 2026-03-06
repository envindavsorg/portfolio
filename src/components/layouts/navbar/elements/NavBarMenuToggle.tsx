'use client';

import { MenuIcon } from '@/components/layouts/navbar/elements/NavBarMenuIcon';
import { Button } from '@/components/primitives/Button';
import { useNavBar } from './NavBarContext';

export const NavBarMenuToggle = () => {
	const { isSecondaryMenuOpen, toggleSecondaryMenu } = useNavBar();

	return (
		<Button
			aria-expanded={isSecondaryMenuOpen}
			aria-label="Menu principal"
			className="sm:hidden"
			onClick={toggleSecondaryMenu}
			size="icon"
			variant="outline"
		>
			<MenuIcon isOpen={isSecondaryMenuOpen} />
		</Button>
	);
};
