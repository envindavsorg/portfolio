import { Panel } from '@/components/ui/Panel';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/utils';
import { ToolsContent } from './ToolsContent';
import { ToolsTitle } from './ToolsTitle';

const Tools = () => {
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
