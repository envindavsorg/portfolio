"use client";

import type { ChangeEvent } from "react";
import { Suspense, useCallback, useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Button, CopyButton } from "@/components/primitives/Button";
import { Checkbox } from "@/components/primitives/Checkbox";
import { Input } from "@/components/primitives/Input";
import { Textarea } from "@/components/primitives/Textarea";
import type { ControlValues } from "@/lib/playground";
import { defaultValues, toJsx, toProps } from "@/lib/playground";
import { m } from "@/paraglide/messages";
import type { PlaygroundDefinition } from "@/registry/playgrounds";

interface ComponentPlaygroundProps {
  /** nom du composant dans le registre, pas celui de sa démo */
  name: string;
  definition: PlaygroundDefinition;
}

const toLines = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export const ComponentPlayground = ({
  name,
  definition,
}: ComponentPlaygroundProps) => {
  const { component: Component, controls, displayName } = definition;

  const [values, setValues] = useState<ControlValues>(() =>
    defaultValues(controls)
  );

  const props = useMemo(
    () => toProps(controls, values),
    [controls, values]
  );

  const jsx = useMemo(
    () => toJsx(displayName, controls, values),
    [controls, displayName, values]
  );

  const setValue = useCallback(
    (prop: string, value: ControlValues[string]) =>
      setValues((current) => ({ ...current, [prop]: value })),
    []
  );

  const handleReset = useCallback(
    () => setValues(defaultValues(controls)),
    [controls]
  );

  /**
   * Le rendu est remonté à chaque changement de props.
   *
   * Les composants du registre sont animés et pilotent leur animation dans un
   * effet au montage : sans remontage, changer l'intervalle ou la vitesse ne se
   * verrait qu'au cycle suivant, ou pas du tout.
   */
  const renderKey = JSON.stringify(values);

  return (
    <div
      className="flex w-full flex-col gap-y-4"
      data-slot="component-playground"
    >
      <div className="flex min-h-40 items-center justify-center rounded-md border border-input p-4">
        <Suspense>
          <Component key={renderKey} {...props} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-y-3">
        <div className="flex items-center justify-between gap-x-2">
          <Label>{m.writings_playground_controls()}</Label>
          <Button onClick={handleReset} size="sm" variant="outline">
            {m.writings_playground_reset()}
          </Button>
        </div>

        {controls.map((control) => {
          const id = `playground-${name}-${control.prop}`;
          const value = values[control.prop];

          if (control.kind === "boolean") {
            return (
              <div
                className="flex items-center gap-x-2"
                key={control.prop}
              >
                <Checkbox
                  checked={value === true}
                  id={id}
                  onCheckedChange={(checked) =>
                    setValue(control.prop, checked === true)
                  }
                />
                <Label htmlFor={id}>{control.label()}</Label>
              </div>
            );
          }

          if (control.kind === "lines") {
            return (
              <div
                className="flex flex-col gap-y-1"
                key={control.prop}
              >
                <Label htmlFor={id}>{control.label()}</Label>
                <Textarea
                  className="min-h-20 font-mono text-xs"
                  id={id}
                  onChange={(
                    event: ChangeEvent<HTMLTextAreaElement>
                  ) =>
                    setValue(
                      control.prop,
                      toLines(event.target.value)
                    )
                  }
                  spellCheck={false}
                  value={Array.isArray(value) ? value.join("\n") : ""}
                />
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-y-1" key={control.prop}>
              <Label htmlFor={id}>{control.label()}</Label>
              <Input
                className="font-mono text-xs"
                id={id}
                max={control.max}
                min={control.min}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setValue(
                    control.prop,
                    control.kind === "number"
                      ? Number(event.target.value)
                      : event.target.value
                  )
                }
                spellCheck={false}
                step={control.step}
                type={control.kind === "number" ? "number" : "text"}
                value={
                  typeof value === "string" ||
                  typeof value === "number"
                    ? value
                    : ""
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-2">
          <Label>{m.writings_playground_code()}</Label>
          <CopyButton
            getValueAction={() => Promise.resolve(jsx)}
            label={m.writings_playground_copy_aria()}
            size="icon"
            variant="outline"
          />
        </div>

        <pre className="overflow-x-auto rounded-md border border-input p-3 font-mono text-xs">
          <code>{jsx}</code>
        </pre>

        <p className="text-muted-foreground text-xs">
          {m.writings_playground_note()}
        </p>
      </div>
    </div>
  );
};
