'use client';

import {
	ArrowsClockwiseIcon,
	CheckIcon,
	CopyIcon,
} from '@phosphor-icons/react';
import { type ChangeEvent, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { DirectionAwareTabs } from '@/components/ui/DirectionAwareTabs';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
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
				String.fromCodePoint(byte),
			).join('');
			const encoded = btoa(binaryString);
			setEncodeOutputText(encoded);
			setError(null);
		} catch (_err) {
			setError("Erreur lors de l'encodage");
			setEncodeOutputText('');
		}
	}, []);

	const decodeFromBase64 = useCallback((text: string) => {
		try {
			const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
			const cleanText = text.trim();

			if (!base64Regex.test(cleanText)) {
				setError(
					'Format Base64 invalide. Utilisez uniquement A-Z, a-z, 0-9, +, / et =',
				);
				setDecodeOutputText('');
				return;
			}

			const urlDecoded = decodeURIComponent(cleanText);
			const binaryString = atob(urlDecoded);
			const uint8Array = Uint8Array.from(
				binaryString,
				(char) => char.codePointAt(0) ?? 0,
			);
			const decoded = new TextDecoder('utf-8', { fatal: true }).decode(
				uint8Array,
			);

			if (decoded.includes('\uFFFD')) {
				setError(
					'Le texte décodé contient des caractères invalides. Vérifiez le Base64.',
				);
				setDecodeOutputText('');
				return;
			}

			setDecodeOutputText(decoded);
			setError(null);
		} catch (_err) {
			setError(
				'Erreur lors du décodage. Vérifiez que le texte est un Base64 valide.',
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
		[encodeToBase64],
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
		[decodeFromBase64],
	);

	const handleCopy = useCallback((text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
		toast.success('Texte copié dans le presse-papier !');
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
			label: 'Encoder la chaîne',
			content: (
				<div className="flex w-full flex-col gap-y-6 overflow-hidden py-3">
					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label
								className="text-xl sm:text-2xl"
								htmlFor="encodeText"
							>
								Texte à encoder
							</Label>
							{encodeInputText && (
								<Button
									onClick={() =>
										handleCopy(
											encodeInputText,
											'encode-input',
										)
									}
									variant="outline"
								>
									{copiedField === 'encode-input' ? (
										<>
											<CheckIcon /> Copié !
										</>
									) : (
										<>
											<CopyIcon /> Copier
										</>
									)}
								</Button>
							)}
						</div>
						<Textarea
							className="outline-0"
							onChange={(
								event: ChangeEvent<HTMLTextAreaElement>,
							) => handleEncodeInputChange(event.target.value)}
							placeholder="Entrez votre texte ici..."
							value={encodeInputText}
							rows={4}
							id="encodeText"
						/>
					</div>

					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label
								className="text-xl sm:text-2xl"
								htmlFor="decodedText"
							>
								Base64
							</Label>
							{encodeOutputText && (
								<Button
									onClick={() =>
										handleCopy(
											encodeOutputText,
											'encode-output',
										)
									}
									variant="outline"
								>
									{copiedField === 'encode-output' ? (
										<>
											<CheckIcon /> Copié !
										</>
									) : (
										<>
											<CopyIcon /> Copier
										</>
									)}
								</Button>
							)}
						</div>
						<div className="min-h-[100px] w-full overflow-auto rounded-md bg-accent px-3 py-2 text-sm">
							{encodeOutputText}
						</div>
					</div>
				</div>
			),
		},
		{
			id: 1,
			label: 'Décoder la chaîne',
			content: (
				<div className="flex w-full flex-col gap-y-6 overflow-hidden py-3">
					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label
								className="text-xl sm:text-2xl"
								htmlFor="encodedText"
							>
								Base64
							</Label>
							{decodeInputText && (
								<Button
									onClick={() =>
										handleCopy(
											decodeInputText,
											'decode-input',
										)
									}
									variant="outline"
								>
									{copiedField === 'decode-input' ? (
										<>
											<CheckIcon /> Copié !
										</>
									) : (
										<>
											<CopyIcon /> Copier
										</>
									)}
								</Button>
							)}
						</div>
						<Textarea
							className="outline-0"
							onChange={(
								event: ChangeEvent<HTMLTextAreaElement>,
							) => handleDecodeInputChange(event.target.value)}
							placeholder="Collez du Base64 ici pour le décoder..."
							value={decodeInputText}
							id="encodedText"
						/>
					</div>

					<div className="flex flex-col gap-y-3">
						<div className="flex items-center justify-between">
							<Label
								className="text-xl sm:text-2xl"
								htmlFor="decodesText"
							>
								Texte décodé
							</Label>
							{decodeOutputText && (
								<Button
									onClick={() =>
										handleCopy(
											decodeOutputText,
											'decode-output',
										)
									}
									variant="outline"
								>
									{copiedField === 'decode-output' ? (
										<>
											<CheckIcon /> Copié !
										</>
									) : (
										<>
											<CopyIcon /> Copier
										</>
									)}
								</Button>
							)}
						</div>
						<div
							className={cn(
								'min-h-[100px] w-full overflow-auto rounded-md bg-accent px-3 py-2 text-sm',
								error && 'text-destructive',
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
			<DirectionAwareTabs tabs={tabs} />

			<div className="screen-line-before flex justify-end py-1.5">
				<Button onClick={handleReset} variant="outline">
					<ArrowsClockwiseIcon />
					Réinitialiser les champs
				</Button>
			</div>
		</>
	);
};
