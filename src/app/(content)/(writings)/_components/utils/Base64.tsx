'use client';

import {
	ArrowsClockwiseIcon,
	CheckIcon,
	CopyIcon,
} from '@phosphor-icons/react';
import { type ChangeEvent, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/primitives/Button';
import { Label } from '@/components/primitives/Label';
import { TabsAnimated } from '@/components/primitives/Tabs';
import { Textarea } from '@/components/primitives/Textarea';
import { cn } from '@/lib/utils';

export const Base64 = () => {
	const [encodeInputText, setEncodeInputText] = useState('');
	const [encodeOutputText, setEncodeOutputText] = useState('');
	const [decodeInputText, setDecodeInputText] = useState('');
	const [decodeOutputText, setDecodeOutputText] = useState('');
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const encodeToBase64 = useCallback((text: string) => {
		try {
			const uint8Array = new TextEncoder().encode(text);
			const binaryString = Array.from(uint8Array, (byte) =>
				String.fromCodePoint(byte)
			).join('');
			const encoded = btoa(binaryString);
			setEncodeOutputText(encoded);
			setError(null);
		} catch (_err) {
			setError("erreur lors de l'encodage");
			setEncodeOutputText('');
		}
	}, []);

	const decodeFromBase64 = useCallback((text: string) => {
		try {
			const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
			const cleanText = text.trim();

			if (!base64Regex.test(cleanText)) {
				setError(
					'format Base64 invalide. utilisez uniquement A-Z, a-z, 0-9, +, / et ='
				);
				setDecodeOutputText('');
				return;
			}

			const urlDecoded = decodeURIComponent(cleanText);
			const binaryString = atob(urlDecoded);
			const uint8Array = Uint8Array.from(
				binaryString,
				(char) => char.codePointAt(0) ?? 0
			);
			const decoded = new TextDecoder('utf-8', { fatal: true }).decode(
				uint8Array
			);

			if (decoded.includes('\uFFFD')) {
				setError('le texte décodé contient des caractères invalides.');
				setDecodeOutputText('');
				return;
			}

			setDecodeOutputText(decoded);
			setError(null);
		} catch (_err) {
			setError(
				'erreur lors du décodage. vérifiez que le texte est un Base64 valide.'
			);
			setDecodeOutputText('');
		}
	}, []);

	const handleEncodeInputChange = useCallback(
		(value: string) => {
			setEncodeInputText(value);
			if (value) {
				encodeToBase64(value);
			} else {
				setEncodeOutputText('');
			}
		},
		[encodeToBase64]
	);

	const handleDecodeInputChange = useCallback(
		(value: string) => {
			setDecodeInputText(value);
			if (value) {
				decodeFromBase64(value);
			} else {
				setDecodeOutputText('');
				setError(null);
			}
		},
		[decodeFromBase64]
	);

	const handleCopy = useCallback((text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
		toast.success('texte copié dans le presse-papier !');
	}, []);

	const handleReset = useCallback(() => {
		setEncodeInputText('');
		setEncodeOutputText('');
		setDecodeInputText('');
		setDecodeOutputText('');
		setError(null);
	}, []);

	const tabs = [
		{
			id: 0,
			label: 'encoder la chaîne',
			content: (
				<div className="flex w-full flex-col gap-y-6 overflow-hidden py-3">
					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-xl sm:text-2xl" htmlFor="encodeText">
								texte à encoder
							</Label>
							{encodeInputText && (
								<Button
									onClick={() => handleCopy(encodeInputText, 'encode-input')}
									variant="outline"
								>
									{copiedField === 'encode-input' ? (
										<>
											<CheckIcon /> copié !
										</>
									) : (
										<>
											<CopyIcon /> copier
										</>
									)}
								</Button>
							)}
						</div>
						<Textarea
							className="outline-0"
							id="encodeText"
							onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
								handleEncodeInputChange(event.target.value)
							}
							placeholder="entrez votre texte ici..."
							rows={4}
							value={encodeInputText}
						/>
					</div>

					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-xl sm:text-2xl" htmlFor="decodedText">
								base64
							</Label>
							{encodeOutputText && (
								<Button
									onClick={() => handleCopy(encodeOutputText, 'encode-output')}
									variant="outline"
								>
									{copiedField === 'encode-output' ? (
										<>
											<CheckIcon /> copié !
										</>
									) : (
										<>
											<CopyIcon /> copier
										</>
									)}
								</Button>
							)}
						</div>
						<div className="min-h-25 w-full overflow-auto rounded-md bg-accent px-3 py-2 text-sm">
							{encodeOutputText}
						</div>
					</div>
				</div>
			),
		},
		{
			id: 1,
			label: 'décoder la chaîne',
			content: (
				<div className="flex w-full flex-col gap-y-6 overflow-hidden py-3">
					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-xl sm:text-2xl" htmlFor="encodedText">
								base64
							</Label>
							{decodeInputText && (
								<Button
									onClick={() => handleCopy(decodeInputText, 'decode-input')}
									variant="outline"
								>
									{copiedField === 'decode-input' ? (
										<>
											<CheckIcon /> copié !
										</>
									) : (
										<>
											<CopyIcon /> copier
										</>
									)}
								</Button>
							)}
						</div>
						<Textarea
							className="outline-0"
							id="encodedText"
							onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
								handleDecodeInputChange(event.target.value)
							}
							placeholder="collez du Base64 ici pour le décoder..."
							value={decodeInputText}
						/>
					</div>

					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-xl sm:text-2xl" htmlFor="decodesText">
								texte décodé
							</Label>
							{decodeOutputText && (
								<Button
									onClick={() => handleCopy(decodeOutputText, 'decode-output')}
									variant="outline"
								>
									{copiedField === 'decode-output' ? (
										<>
											<CheckIcon /> copié !
										</>
									) : (
										<>
											<CopyIcon /> copier
										</>
									)}
								</Button>
							)}
						</div>
						<div
							className={cn(
								'min-h-25 w-full overflow-auto rounded-md bg-accent px-3 py-2 text-sm',
								error && 'text-destructive'
							)}
						>
							{error ? error : decodeOutputText}
						</div>
					</div>
				</div>
			),
		},
	];

	return (
		<>
			<TabsAnimated tabs={tabs} />

			<div className="screen-line-before flex justify-end py-1.5">
				<Button onClick={handleReset} variant="outline">
					<ArrowsClockwiseIcon />
					réinitialiser les champs
				</Button>
			</div>
		</>
	);
};
