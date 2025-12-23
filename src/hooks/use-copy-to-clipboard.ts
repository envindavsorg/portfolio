import { useCallback, useEffect, useState } from 'react';

const useCopyToClipboard = (initialText = 'Copier') => {
	const [buttonText, setButtonText] = useState(initialText);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

	const handleCopy = useCallback(
		(text: string) => {
			navigator.clipboard.writeText(text).then(() => {
				setButtonText('Copié !');
				const id = setTimeout(() => setButtonText(initialText), 1200);
				setTimeoutId(id);
			});
		},
		[initialText]
	);

	useEffect(
		() => () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		},
		[timeoutId]
	);

	return { buttonText, handleCopy };
};

export default useCopyToClipboard;
