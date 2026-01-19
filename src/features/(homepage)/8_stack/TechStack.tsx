import { Panel } from '@/components/Panel';
import { TECH_STACK } from './content';
import { TechStackContent } from './TechStackContent';
import { TechStackTitle } from './TechStackTitle';

const TechStack = () => (
	<Panel id="my-stack">
		<TechStackTitle />
		<TechStackContent content={TECH_STACK} />
	</Panel>
);

TechStack.displayName = 'TechStack';

export { TechStack };
