import { useTheme } from 'next-themes';
import React from 'react';
import { META_THEME_COLORS } from '@/data/theme';

const useMetaColor = () => {
	const { resolvedTheme } = useTheme();

	const metaColor = React.useMemo(
		() => (resolvedTheme === 'dark' ? META_THEME_COLORS.dark : META_THEME_COLORS.light),
		[resolvedTheme]
	);

	const setMetaColor = React.useCallback((color: string) => {
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
	}, []);

	return {
		metaColor,
		setMetaColor,
	};
};

export default useMetaColor;
