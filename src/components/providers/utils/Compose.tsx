import type React from "react";

export interface Props {
  children: React.ReactNode;
}
export type Provider = (p: Props) => React.JSX.Element;

const IdentityProvider: Provider = ({ children }: Props) => (
  <>{children}</>
);

export const Compose = (...p: Provider[]) => {
  let Acc: Provider = IdentityProvider;

  for (let index = p.length - 1; index >= 0; index -= 1) {
    const P = p[index];
    const Previous = Acc;
    Acc = ({ children }: Props) => (
      <P>
        <Previous>{children}</Previous>
      </P>
    );
  }

  return Acc;
};
