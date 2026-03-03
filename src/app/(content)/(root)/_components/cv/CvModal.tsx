import type React from 'react';
import { Button } from '@/components/primitives/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/primitives/Dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/primitives/Drawer';

interface CvModalProps {
	children: React.ReactNode;
	open: boolean;
	setOpen: (open: boolean) => void;
	isDesktop: boolean;
}

export const CvModal = ({ children, open, setOpen, isDesktop }: CvModalProps) => {
	const Container = isDesktop ? Dialog : Drawer;
	const Content = isDesktop ? DialogContent : DrawerContent;
	const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;

	return (
		<Container onOpenChange={setOpen} open={open}>
			<Trigger asChild>
				<Button>recevoir par mail</Button>
			</Trigger>
			<Content
				aria-describedby="cv-modal-description"
				className="bg-background p-0"
				onInteractOutside={(event) => event.preventDefault()}
			>
				{children}
			</Content>
		</Container>
	);
};
