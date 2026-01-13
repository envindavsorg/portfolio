import type React from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/Drawer';

interface CvModalProps {
	children: React.ReactNode;
	open: boolean;
	setOpen: (open: boolean) => void;
	isDesktop: boolean;
}

const CvModal = ({ children, open, setOpen, isDesktop }: CvModalProps): React.JSX.Element => {
	const Container = isDesktop ? Dialog : Drawer;
	const Content = isDesktop ? DialogContent : DrawerContent;
	const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;

	return (
		<Container onOpenChange={setOpen} open={open}>
			<Trigger asChild>
				<Button>Recevoir par mail</Button>
			</Trigger>
			<Content onInteractOutside={(event) => event.preventDefault()}>{children}</Content>
		</Container>
	);
};

CvModal.displayName = 'CurriulumVitaeModal';

export { CvModal };
