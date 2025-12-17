'use client';

import { CopyIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { AnimatedCheckbox } from '@/components/ui/AnimatedCheckbox';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Label } from '@/components/ui/Label';
import { NumberInput } from '@/components/ui/NumberInput';
import { Textarea } from '@/components/ui/Textarea';
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
					htmlFor="howManyParagraphs"
					className="text-muted-foreground text-xs"
				>
					Combien de paragraphes ?
				</Label>
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<NumberInput
							id="howManyParagraphs"
							placeholder="Entrez le nombre de paragraphes ..."
							min={1}
							max={25}
							value={inputAmount}
							defaultValue={2}
							onValueChange={handleChange}
							onFocus={(event) => event.target.select()}
						/>
					</div>
					<Combobox
						className="w-42"
						data={generationOptions}
						onSelect={(value: GenerationUnit) =>
							setGenerationUnit(value)
						}
						value={generationUnit}
						search={false}
					/>
				</div>
			</div>

			<div className="screen-line-after flex items-center gap-3 py-3 sm:gap-6">
				<div className="flex items-center gap-x-1">
					<AnimatedCheckbox
						checked={startWithStandard}
						disabled={generationUnit === 'words'}
						id="standardSentence"
						onCheckedChange={() =>
							setStartWithStandard(!startWithStandard)
						}
					/>
					<Label
						className="cursor-pointer"
						htmlFor="standardSentence"
					>
						Lorem Ipsum en premier
					</Label>
				</div>

				<div className="flex items-center gap-x-1">
					<AnimatedCheckbox
						checked={asHTML}
						id="asHtml"
						onCheckedChange={() => setAsHTML(!asHTML)}
					/>
					<Label className="cursor-pointer" htmlFor="asHtml">
						Format HTML
					</Label>
				</div>
			</div>

			<div className="screen-line-after flex flex-col gap-y-2 py-3">
				<Label
					htmlFor="generatedText"
					className="text-muted-foreground text-xs"
				>
					Texte généré
				</Label>
				<Textarea
					readOnly
					rows={textAreaRows}
					value={output}
					id="generatedText"
				/>
			</div>

			<div className="flex justify-between py-1.5">
				<Button onClick={() => handleCopy(output)} variant="outline">
					<CopyIcon />
					{buttonText}
				</Button>
				<Button onClick={() => generateText()}>Générer</Button>
			</div>
		</>
	);
};
