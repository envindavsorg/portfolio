import type React from 'react';
import type { Certification } from '@/features/(homepage)/10_certifications/data/certifications';
import type { Project } from '@/features/(homepage)/13_projects/data/projects';

interface PostsLengthProps {
	items: Post[] | Certification[] | Project[];
	slug: string;
}

export const PostsLength = ({ items, slug }: PostsLengthProps): React.JSX.Element => (
	<span className="select-none font-mono text-theme text-xs sm:text-sm">
		({items.length} {slug}
		{items.length > 1 ? 's' : ''})
	</span>
);
