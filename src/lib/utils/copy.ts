const copyText = async (text: string): Promise<boolean> => {
	if (!navigator?.clipboard) {
		console.warn('Clipboard not supported in this browser !');
		return false;
	}

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('Copy failed !', error);
		return false;
	}
};

export default copyText;
