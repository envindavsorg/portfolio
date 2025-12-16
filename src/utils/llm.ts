type PromptType = 'component' | 'general' | 'summary';

const getPrompt = (url: string, type: PromptType = 'general'): string => {
	switch (type) {
		case 'component':
			return `
You are an expert Senior React Developer and UI/UX Specialist.
I am looking at this component documentation: ${url}

Task:
1. Analyze the component's API, props, and usage patterns.
2. Explain how to integrate it into a Next.js (TypeScript) project.
3. Provide a practical code example using Functional Components and Hooks.
4. Highlight specific pitfalls regarding Server-Side Rendering (SSR) vs Client-Side Rendering ('use client').

Please maintain a concise, technical tone.
`.trim();

		case 'summary':
			return `
Analyze the content at: ${url}
Provide a high-level executive summary of the key points, followed by 3 potential questions a developer might ask about this topic.
`.trim();

		default:
			return `
I am providing this URL as context: ${url}
Please analyze the content. I will be asking specific questions about its implementation and logic.
`.trim();
	}
};

export default getPrompt;
