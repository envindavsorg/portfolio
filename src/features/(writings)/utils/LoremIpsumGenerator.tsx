'use client';

import { CopyIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { AnimatedCheckbox } from '@/components/animations/AnimatedCheckbox';
import { Button } from '@/components/buttons/Button';
import { Combobox } from '@/components/elements/Combobox';
import { Label } from '@/components/form/Label';
import { NumberInput } from '@/components/form/NumberInput';
import { Textarea } from '@/components/form/Textarea';
import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';
import { generateLoremIpsum } from '@/lib/lorem-ipsum';

const generationOptions = [
	{
		value: 'paragraphs',
		label: 'Paragraphes',
	},
	{
		value: 'sentences',
		label: 'Phrases',
	},
	{
		value: 'words',
		label: 'Mots',
	},
];

declare type GenerationUnit = 'words' | 'sentences' | 'paragraphs';

export const LoremIpsumGenerator = () => {
	const [inputAmount, setInputAmount] = useState(2);
	const [textAreaRows, setTextAreaRows] = useState(9);
	const [output, setOutput] = useState('');
	const [generationUnit, setGenerationUnit] =
		useState<GenerationUnit>('paragraphs');
	const [asHTML, setAsHTML] = useState(false);
	const [startWithStandard, setStartWithStandard] = useState(false);
	const { buttonText, handleCopy } = useCopyToClipboard();

	const handleChange = (value: number | undefined) => {
		if (value && value > 0 && value < 100) {
			setInputAmount(value);
			setTextAreaRows(value === 1 ? 4 : 9);
		}
	};

	const generateText = useCallback(() => {
		const text = generateLoremIpsum({
			generationUnit,
			inputAmount,
			startWithStandard,
			asHTML,
		});

		setOutput(text);
	}, [inputAmount, generationUnit, asHTML, startWithStandard]);

	useEffect(() => {
		generateText();
	}, [generateText]);

	return (
		<>
			<div className="screen-line-after flex flex-col gap-y-2 py-3">
				<Label
					className="text-muted-foreground text-xs"
					htmlFor="howManyParagraphs"
				>
					combien de paragraphes ?
				</Label>
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<NumberInput
							defaultValue={2}
							id="howManyParagraphs"
							max={25}
							min={1}
							onFocus={(event) => event.target.select()}
							onValueChange={handleChange}
							placeholder="entrez le nombre de paragraphes ..."
							value={inputAmount}
						/>
					</div>
					<Combobox
						className="w-42"
						data={generationOptions}
						onSelect={(value: GenerationUnit) => setGenerationUnit(value)}
						search={false}
						value={generationUnit}
					/>
				</div>
			</div>

			<div className="screen-line-after flex items-center gap-3 py-3 sm:gap-6">
				<div className="flex items-center gap-x-1">
					<AnimatedCheckbox
						checked={startWithStandard}
						disabled={generationUnit === 'words'}
						id="standardSentence"
						onCheckedChange={() => setStartWithStandard(!startWithStandard)}
					/>
					<Label className="cursor-pointer" htmlFor="standardSentence">
						lorem Ipsum en premier
					</Label>
				</div>

				<div className="flex items-center gap-x-1">
					<AnimatedCheckbox
						checked={asHTML}
						id="asHtml"
						onCheckedChange={() => setAsHTML(!asHTML)}
					/>
					<Label className="cursor-pointer" htmlFor="asHtml">
						format HTML
					</Label>
				</div>
			</div>

			<div className="screen-line-after flex flex-col gap-y-2 py-3">
				<Label
					className="text-muted-foreground text-xs"
					htmlFor="generatedText"
				>
					texte généré
				</Label>
				<Textarea
					id="generatedText"
					readOnly
					rows={textAreaRows}
					value={output}
				/>
			</div>

			<div className="flex justify-between py-1.5">
				<Button onClick={() => handleCopy(output)} variant="outline">
					<CopyIcon />
					{buttonText}
				</Button>
				<Button onClick={() => generateText()}>générer</Button>
			</div>
		</>
	);
};
