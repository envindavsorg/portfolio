'use client';

import { CopyIcon } from '@phosphor-icons/react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';

export const JSONFormatter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const { buttonText, handleCopy } = useCopyToClipboard();

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			const { value } = event.currentTarget;
			setInput(value);

			try {
				const parsedJSON = JSON.parse(value.trim());
				const formattedJSON = JSON.stringify(parsedJSON, null, 2);

				setOutput(formattedJSON);
			} catch {
				setOutput('Oups, le JSON est incorrect !');
			}
		},
		[],
	);

	return (
		<>
			<div className="screen-line-after flex flex-col gap-y-6 py-3">
				<div className="flex flex-col gap-y-2">
					<Label
						htmlFor="jsonTextArea"
						className="text-muted-foreground text-xs"
					>
						JSON
					</Label>
					<Textarea
						className="outline-0"
						onChange={handleChange}
						placeholder="Collez le JSON ici ..."
						value={input}
						id="jsonTextArea"
						rows={6}
					/>
				</div>

				<div className="flex flex-col gap-y-2">
					<Label
						htmlFor="jsonTextAreaOutput"
						className="text-muted-foreground text-xs"
					>
						JSON mis en forme
					</Label>
					<Textarea
						className="outline-0"
						value={output}
						id="jsonTextAreaOutput"
						rows={6}
					/>
				</div>
			</div>

			<div className="flex justify-end py-1.5">
				<Button onClick={() => handleCopy(output)} variant="outline">
					<CopyIcon />
					{buttonText}
				</Button>
			</div>
		</>
	);
};
