'use client';

import {
	ArrowsDownUpIcon,
	BroomIcon,
	CopyIcon,
	MinusIcon,
} from '@phosphor-icons/react';
import { type ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/primitives/Button';
import { Divider } from '@/components/primitives/Divider';
import { Label } from '@/components/primitives/Label';
import { Textarea } from '@/components/primitives/Textarea';
import useCopyToClipboard from '@/hooks/useCopyToClipboard';

const sortKeys = (obj: unknown): unknown => {
	if (Array.isArray(obj)) {
		return obj.map(sortKeys);
	}
	if (obj !== null && typeof obj === 'object') {
		return Object.keys(obj as Record<string, unknown>)
			.sort()
			.reduce<Record<string, unknown>>((acc, key) => {
				acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
				return acc;
			}, {});
	}
	return obj;
};

const formatJSON = (value: string): { output: string; isValid: boolean } => {
	if (!value.trim()) {
		return { output: '', isValid: true };
	}

	try {
		return {
			output: JSON.stringify(JSON.parse(value.trim()), null, '\t\t'),
			isValid: true,
		};
	} catch {
		return { output: 'Le JSON saisi est invalide.', isValid: false };
	}
};

const minifyJSON = (value: string): string => {
	try {
		return JSON.stringify(JSON.parse(value.trim()));
	} catch {
		return value;
	}
};

const sortJSONKeys = (value: string): string => {
	try {
		return JSON.stringify(sortKeys(JSON.parse(value.trim())), null, '\t\t');
	} catch {
		return value;
	}
};

interface JSONStats {
	keys: number;
	lines: number;
	size: number;
}

const getJSONStats = (value: string): JSONStats | null => {
	try {
		const parsed = JSON.parse(value.trim());
		const formatted = JSON.stringify(parsed, null, 2);
		return {
			keys:
				typeof parsed === 'object' && parsed !== null
					? Object.keys(parsed).length
					: 0,
			lines: formatted.split('\n').length,
			size: new Blob([JSON.stringify(parsed)]).size,
		};
	} catch {
		return null;
	}
};

const formatSize = (bytes: number): string => {
	if (bytes < 1024) {
		return `${bytes} octets`;
	}
	return `${(bytes / 1024).toFixed(1)} Ko`;
};

type TokenType =
	| 'key'
	| 'string'
	| 'number'
	| 'boolean'
	| 'null'
	| 'punctuation';

const TOKEN_CLASSES: Record<TokenType, string> = {
	key: 'text-sky-400',
	string: 'text-emerald-400',
	number: 'text-amber-400',
	boolean: 'text-violet-400',
	null: 'text-red-400',
	punctuation: 'text-muted-foreground',
};

interface Token {
	type: TokenType;
	value: string;
}

const tokenize = (json: string): Token[] => {
	const tokens: Token[] = [];
	const lines = json.split('\n');

	for (const line of lines) {
		let remaining = line;

		while (remaining.length > 0) {
			const leadingWhitespace = remaining.match(/^(\s+)/);
			if (leadingWhitespace) {
				tokens.push({ type: 'punctuation', value: leadingWhitespace[1] });
				remaining = remaining.slice(leadingWhitespace[1].length);
				continue;
			}

			const keyMatch = remaining.match(/^("(?:[^"\\]|\\.)*")\s*:/);
			if (keyMatch) {
				tokens.push({ type: 'key', value: keyMatch[1] });
				tokens.push({ type: 'punctuation', value: ': ' });
				remaining = remaining.slice(keyMatch[0].length).trimStart();
				continue;
			}

			const stringMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
			if (stringMatch) {
				tokens.push({ type: 'string', value: stringMatch[1] });
				remaining = remaining.slice(stringMatch[1].length);
				continue;
			}

			const numberMatch = remaining.match(
				/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/
			);
			if (numberMatch) {
				tokens.push({ type: 'number', value: numberMatch[1] });
				remaining = remaining.slice(numberMatch[1].length);
				continue;
			}

			const boolMatch = remaining.match(/^(true|false)/);
			if (boolMatch) {
				tokens.push({ type: 'boolean', value: boolMatch[1] });
				remaining = remaining.slice(boolMatch[1].length);
				continue;
			}

			const nullMatch = remaining.match(/^(null)/);
			if (nullMatch) {
				tokens.push({ type: 'null', value: nullMatch[1] });
				remaining = remaining.slice(nullMatch[1].length);
				continue;
			}

			tokens.push({ type: 'punctuation', value: remaining[0] });
			remaining = remaining.slice(1);
		}

		tokens.push({ type: 'punctuation', value: '\n' });
	}

	return tokens;
};

const SyntaxHighlight = ({ json }: { json: string }) => {
	const tokens = useMemo(() => tokenize(json), [json]);

	return (
		<pre
			className="my-0 overflow-auto rounded-md border border-input bg-background p-4 font-mono text-base! leading-relaxed sm:text-lg!"
			style={{ tabSize: 2 }}
		>
			{' '}
			<code className="border-0! bg-background!">
				{tokens.map((token, index) => (
					<span className={TOKEN_CLASSES[token.type]} key={index}>
						{token.value}
					</span>
				))}
			</code>
		</pre>
	);
};

export const JSONFormatter = () => {
	const [input, setInput] = useState('');
	const { handleCopy } = useCopyToClipboard();
	const { output, isValid } = useMemo(() => formatJSON(input), [input]);
	const stats = useMemo(
		() => (isValid && output ? getJSONStats(input) : null),
		[input, isValid, output]
	);

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) => {
			setInput(event.currentTarget.value);
		},
		[]
	);

	const handleMinify = useCallback(() => {
		setInput((prev) => minifyJSON(prev));
	}, []);

	const handleSortKeys = useCallback(() => {
		setInput((prev) => sortJSONKeys(prev));
	}, []);

	const handleClear = useCallback(() => {
		setInput('');
	}, []);

	const hasOutput = isValid && output;

	return (
		<>
			<div className="screen-line-after flex flex-col gap-y-6 py-3">
				<div className="flex flex-col gap-y-3">
					<Label className="text-foreground text-sm" htmlFor="json-input">
						entrez votre json à formatter
					</Label>
					<Textarea
						className="outline-0"
						id="json-input"
						onChange={handleChange}
						placeholder="Collez le JSON ici ..."
						rows={8}
						spellCheck={false}
						value={
							process.env.NODE_ENV === 'development'
								? '{"name":"Cuzeac Florin","role":"développeur full-stack","stack":["Next.js","TypeScript","Tailwind CSS"],"experience":{"years":8,"companies":[{"name":"Économat des Armées","type":"alternance"},{"name":"SpinalCom","type":"startup"},{"name":"WeFix","type":"CDI"}]},"available":true}'
								: input
						}
					/>
				</div>

				<Divider border={false} type="half" />

				<div className="flex flex-col gap-y-3">
					<Label className="text-foreground text-sm">json mis en forme</Label>
					{hasOutput ? (
						<SyntaxHighlight json={output} />
					) : (
						<div
							aria-live="polite"
							className={`overflow-auto rounded-md border border-input bg-background p-4 font-mono text-sm leading-relaxed ${
								isValid ? 'text-muted-foreground' : 'text-destructive'
							}`}
						>
							{output || 'le résultat apparaîtra ici ...'}
						</div>
					)}
				</div>
			</div>

			{(hasOutput || input.trim()) && (
				<div className="flex items-center justify-between py-1.5">
					{stats && (
						<p className="text-muted-foreground text-xs">
							{stats.keys} clés · {stats.lines} lignes ·{' '}
							{formatSize(stats.size)}
						</p>
					)}

					<div className="ml-auto flex items-center gap-x-2">
						{input.trim() && (
							<Button onClick={handleClear} size="icon" variant="outline">
								<BroomIcon />
							</Button>
						)}

						{hasOutput && (
							<>
								<Button onClick={handleSortKeys} size="icon" variant="outline">
									<ArrowsDownUpIcon />
								</Button>
								<Button onClick={handleMinify} size="icon" variant="outline">
									<MinusIcon />
								</Button>
								<Button
									onClick={() => handleCopy(output)}
									size="icon"
									variant="outline"
								>
									<CopyIcon />
								</Button>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
};
