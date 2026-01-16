import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { TECH_STACK } from './content';
import { TechStackContent } from './TechStackContent';
import { TechStackTitle } from './TechStackTitle';

const TechStack = (): React.JSX.Element => (
	<Panel id="my-stack">
		<TechStackTitle />
		<TechStackContent content={TECH_STACK} />
	</Panel>
);

TechStack.displayName = 'TechStack';

export { TechStack };
