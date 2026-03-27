"use client";

import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Button, CopyButton } from "@/components/primitives/Button";
import { TabsAnimated } from "@/components/primitives/Tabs";
import { Textarea } from "@/components/primitives/Textarea";
import { cn } from "@/lib/utils";

const encodeToBase64 = (
  text: string
): { result: string; error: string | null } => {
  if (!text) {
    return { error: null, result: "" };
  }

  try {
    const uint8Array = new TextEncoder().encode(text);
    const binaryString = Array.from(uint8Array, (byte) =>
      String.fromCodePoint(byte)
    ).join("");
    return { error: null, result: btoa(binaryString) };
  } catch {
    return { error: "erreur lors de l'encodage", result: "" };
  }
};

const BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;

const decodeFromBase64 = (
  text: string
): { result: string; error: string | null } => {
  if (!text) {
    return { error: null, result: "" };
  }

  try {
    const cleaned = text.trim();

    if (!BASE64_REGEX.test(cleaned)) {
      return {
        error:
          "format Base64 invalide. utilisez uniquement A-Z, a-z, 0-9, +, / et =",
        result: "",
      };
    }

    const binaryString = atob(decodeURIComponent(cleaned));
    const uint8Array = Uint8Array.from(
      binaryString,
      (char) => char.codePointAt(0) ?? 0
    );
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
      uint8Array
    );

    if (decoded.includes("\uFFFD")) {
      return {
        error: "le texte décodé contient des caractères invalides.",
        result: "",
      };
    }

    return { error: null, result: decoded };
  } catch {
    return {
      error:
        "erreur lors du décodage. vérifiez que le texte est un Base64 valide.",
      result: "",
    };
  }
};

interface FieldSectionProps {
  label: string;
  htmlFor?: string;
  value: string;
  error?: string | null;
  children?: React.ReactNode;
}

const FieldSection = ({
  label,
  htmlFor,
  value,
  error,
  children,
}: FieldSectionProps) => (
  <div className="flex flex-col gap-y-3">
    <div className="flex items-center justify-between">
      <Label className="text-foreground text-sm" htmlFor={htmlFor}>
        {label}
      </Label>
      {value && <CopyButton value={value} />}
    </div>
    {children ?? (
      <div
        className={cn(
          "min-h-45 w-full overflow-auto rounded-md bg-accent px-3 py-2 text-sm",
          error && "text-destructive"
        )}
      >
        {error ?? value}
      </div>
    )}
  </div>
);

export const Base64 = () => {
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");

  const encoded = useMemo(
    () => encodeToBase64(encodeInput),
    [encodeInput]
  );
  const decoded = useMemo(
    () => decodeFromBase64(decodeInput),
    [decodeInput]
  );

  const handleReset = useCallback(() => {
    setEncodeInput("");
    setDecodeInput("");
  }, []);

  const tabs = [
    {
      content: (
        <div className="flex w-full flex-col gap-y-6 overflow-hidden py-3">
          <FieldSection
            htmlFor="encode-input"
            label="texte à encoder"
            value={encodeInput}
          >
            <Textarea
              className="outline-0"
              id="encode-input"
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setEncodeInput(event.target.value)
              }
              placeholder="entrez votre texte ici..."
              rows={8}
              spellCheck={false}
              value={encodeInput}
            />
          </FieldSection>

          <FieldSection
            error={encoded.error}
            label="texte encodé en base64"
            value={encoded.result}
          />
        </div>
      ),
      id: 0,
      label: "encoder la chaîne",
    },
    {
      content: (
        <div className="flex w-full flex-col gap-y-6 overflow-hidden py-3">
          <FieldSection
            htmlFor="decode-input"
            label="texte encodé en base64"
            value={decodeInput}
          >
            <Textarea
              className="outline-0"
              id="decode-input"
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setDecodeInput(event.target.value)
              }
              placeholder="collez du Base64 ici pour le décoder..."
              rows={8}
              spellCheck={false}
              value={decodeInput}
            />
          </FieldSection>

          <FieldSection
            error={decoded.error}
            label="texte décodé"
            value={decoded.result}
          />
        </div>
      ),
      id: 1,
      label: "décoder la chaîne",
    },
  ];

  return (
    <>
      <TabsAnimated className="ms-auto max-w-sm" tabs={tabs} />
      <div className="screen-line-before flex justify-end py-1.5">
        <Button onClick={handleReset}>réinitialiser</Button>
      </div>
    </>
  );
};
