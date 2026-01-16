import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { remarkComponent } from '@/lib/remark-component';
import { dayjs } from '@/lib/utils';

const processor = remark().use(remarkMdx).use(remarkComponent).use(remarkGfm);

export const getLLMText = async (post: Post): Promise<string> => {
	const processed = await processor.process({
		value: post.content,
	});

	return `
# ${post.metadata.title}

${post.metadata.description}

${processed.value}

Dernière mise à jour le ${dayjs(post.metadata.updatedAt).format('dddd DD MMMM YYYY')}`;
};
