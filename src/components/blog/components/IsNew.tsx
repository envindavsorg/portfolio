import { memo } from 'react';
import { Prose } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

type IsNewProps = {
	className?: string;
};

export const IsNew = memo(({ className }: IsNewProps) => (
	<div className={cn(className, 'flex items-center gap-x-2')}>
		<span className="relative flex items-center justify-center">
			<span className="absolute inline-flex size-3 animate-ping rounded-full bg-theme opacity-50" />
			<span className="relative inline-flex size-2 rounded-full bg-theme" />
		</span>
		<Prose className="!text-xs !font-medium text-theme max-md:hidden">
			Nouveau
		</Prose>
	</div>
));
