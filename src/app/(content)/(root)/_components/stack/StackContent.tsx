import { Fragment } from 'react';
import {
	Marquee,
	MarqueeContent,
	MarqueeFade,
	MarqueeItem,
} from '@/components/blocks/Marquee';
import { Divider } from '@/components/primitives/Divider';
import { PanelContent } from '@/components/primitives/Panel';
import type { Stack } from './content';

interface StackContentProps {
	content: Stack[];
}

const MARQUEE_DIRECTIONS = ['left', 'right'] as const;

const StackIcon = ({ icon: Icon, title }: Stack) => (
	<MarqueeItem key={title}>
		<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-input ring-1 ring-edge ring-offset-1 ring-offset-background">
			<Icon className="size-6 shrink-0" />
			<p className="sr-only">{title}</p>
		</div>
	</MarqueeItem>
);

export const StackContent = ({ content }: StackContentProps) => (
	<>
		{MARQUEE_DIRECTIONS.map((direction, idx) => {
			const isLast = idx === MARQUEE_DIRECTIONS.length - 1;
			return (
				<Fragment key={direction}>
					{isLast && <Divider after={false} border={false} type="half" />}
					<PanelContent className="screen-line-before">
						<Marquee>
							<MarqueeFade side="left" />
							<MarqueeFade side="right" />
							<MarqueeContent direction={direction}>
								{content.map((item) => (
									<StackIcon key={item.title} {...item} />
								))}
							</MarqueeContent>
						</Marquee>
					</PanelContent>
				</Fragment>
			);
		})}
	</>
);
