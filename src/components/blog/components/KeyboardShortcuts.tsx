'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

type Post = {
	slug: string;
};

type KeyboardShortcutsProps = {
	basePath: string;
	previous: Post | null;
	next: Post | null;
};

export const KeyboardShortcuts = ({
	basePath,
	previous,
	next,
}: KeyboardShortcutsProps) => {
	const router = useRouter();

	const navigate = useCallback(
		(post: Post | null) => {
			if (post) {
				router.push(`${basePath}/${post.slug}`);
			}
		},
		[router, basePath],
	);

	useEffect(() => {
		const abortController = new AbortController();
		const { signal } = abortController;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
				return;
			}

			const target = event.target as HTMLElement;

			const isInput =
				target.isContentEditable ||
				['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

			if (isInput) {
				return;
			}

			event.preventDefault();

			if (event.key === 'ArrowRight') {
				navigate(next);
			} else {
				navigate(previous);
			}
		};

		document.addEventListener('keydown', handleKeyDown, { signal });

		return () => abortController.abort();
	}, [navigate, next, previous]);

	return null;
};
