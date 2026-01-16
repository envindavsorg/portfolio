import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { ToolsContent } from './ToolsContent';
import { ToolsTitle } from './ToolsTitle';

const Tools = (): React.JSX.Element => {
	const utils: Post[] = getPostsByCategory('utils').sort((a: Post, b: Post) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	return (
		<Panel>
			<ToolsTitle />
			<ToolsContent content={utils} />
		</Panel>
	);
};

Tools.displayName = 'Tools';

export { Tools };
