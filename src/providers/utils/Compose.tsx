import type React from 'react';

export type Props = { children: React.ReactNode };
export type Provider = (p: Props) => React.JSX.Element;

export const Compose = (...p: Provider[]) =>
	p.reduceRight(
		(Acc: Provider, P: Provider) =>
			({ children }: Props) => (
				<P>
					<Acc>{children}</Acc>
				</P>
			),
		({ children }: Props) => <>{children}</>
	);
