'use client';

import type React from 'react';
import { FlipSentences } from '@/registry/flip-sentences';

const EXAMPLE_SENTENCES = [
	'Imagine, code, crée, inspire.',
	'Chaque petit pixel compte !',
	'Chaque petit détail compte !',
	'Du concept au déploiement !',
];

const FlipSentencesDemo = (): React.JSX.Element => (
	<div className="flex min-h-64 items-center justify-center">
		<FlipSentences sentences={EXAMPLE_SENTENCES} />
	</div>
);

export default FlipSentencesDemo;
