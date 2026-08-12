/**
 * Bac à sable des composants du registre : régler les props en direct et voir le
 * code correspondant.
 *
 * La génération du code vit ici, séparée du rendu, parce que c'est la partie qui
 * a des cas limites — un booléen faux, une valeur égale au défaut, un tableau à
 * échapper — et qu'elle se teste sans navigateur.
 */

export type ControlValue = string | number | boolean | string[];

export type ControlKind = "boolean" | "number" | "text" | "lines";

export interface PlaygroundControl {
  prop: string;
  kind: ControlKind;
  defaultValue: ControlValue;
  /** bornes pour un contrôle numérique */
  min?: number;
  max?: number;
  step?: number;
}

export type ControlValues = Record<string, ControlValue>;

export const defaultValues = (
  controls: PlaygroundControl[]
): ControlValues =>
  Object.fromEntries(
    controls.map((control) => [control.prop, control.defaultValue])
  );

/** props à passer au composant : les contrôles, tels quels */
export const toProps = (
  controls: PlaygroundControl[],
  values: ControlValues
): Record<string, ControlValue> =>
  Object.fromEntries(
    controls.map((control) => [
      control.prop,
      values[control.prop] ?? control.defaultValue,
    ])
  );

const quote = (value: string): string =>
  `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

const formatValue = (value: ControlValue): string => {
  if (Array.isArray(value)) {
    return `{[${value.map((item) => quote(item)).join(", ")}]}`;
  }
  if (typeof value === "number") {
    return `{${value}}`;
  }
  if (typeof value === "boolean") {
    return `{${value}}`;
  }
  return quote(value);
};

const isSame = (left: ControlValue, right: ControlValue): boolean => {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => item === right[index])
    );
  }
  return left === right;
};

/**
 * Code JSX correspondant aux valeurs courantes.
 *
 * Deux règles rendent le résultat copiable tel quel plutôt que verbeux :
 * une prop restée à sa valeur par défaut est omise, et un booléen vrai s'écrit
 * en forme courte. Recopier `interval={3000} disableAnimation={false}` quand ce
 * sont déjà les valeurs par défaut donne un extrait que personne n'écrirait à la
 * main.
 */
export const toJsx = (
  componentName: string,
  controls: PlaygroundControl[],
  values: ControlValues
): string => {
  const attributes: string[] = [];

  for (const control of controls) {
    const value = values[control.prop] ?? control.defaultValue;

    if (isSame(value, control.defaultValue)) {
      continue;
    }

    if (value === true) {
      attributes.push(control.prop);
      continue;
    }

    attributes.push(`${control.prop}=${formatValue(value)}`);
  }

  if (attributes.length === 0) {
    return `<${componentName} />`;
  }

  const single = `<${componentName} ${attributes.join(" ")} />`;
  const MAX_SINGLE_LINE = 60;

  if (attributes.length === 1 && single.length <= MAX_SINGLE_LINE) {
    return single;
  }

  return [
    `<${componentName}`,
    ...attributes.map((attribute) => `  ${attribute}`),
    "/>",
  ].join("\n");
};

/**
 * Nom du composant réglable derrière une démo.
 *
 * Les pages de composant montrent `<nom>-demo`, une enveloppe sans prop. Le bac à
 * sable doit cibler le composant lui-même — la convention de nommage du registre
 * suffit à faire le lien, sans table de correspondance à tenir à jour.
 */
export const toPlaygroundName = (previewName: string): string =>
  previewName.replace(/-demo$/u, "");
