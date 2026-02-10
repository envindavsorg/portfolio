'use client';

import { Button } from '@/components/buttons/Button';
import { MenuIcon } from '@/components/icons/MenuIcon';
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
