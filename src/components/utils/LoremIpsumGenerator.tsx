"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Button } from "@/components/primitives/Button";
import { CheckboxAnimated } from "@/components/primitives/Checkbox";
import { Combobox } from "@/components/primitives/Combobox";
import { InputNumber } from "@/components/primitives/Input";
import { Textarea } from "@/components/primitives/Textarea";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { generateLoremIpsum } from "@/lib/lorem-ipsum";

type GenerationUnit = "words" | "sentences" | "paragraphs";

const GENERATION_OPTIONS: { value: GenerationUnit; label: string }[] =
  [
    { label: "Paragraphes", value: "paragraphs" },
    { label: "Phrases", value: "sentences" },
    { label: "Mots", value: "words" },
  ];

const UNIT_LABELS: Record<GenerationUnit, string> = {
  paragraphs: "combien de paragraphes ?",
  sentences: "combien de phrases ?",
  words: "combien de mots ?",
};

export const LoremIpsumGenerator = () => {
  const [inputAmount, setInputAmount] = useState(2);
  const [generationUnit, setGenerationUnit] =
    useState<GenerationUnit>("paragraphs");
  const [asHTML, setAsHTML] = useState(false);
  const [startWithStandard, setStartWithStandard] = useState(false);
  const [seed, setSeed] = useState(0);
  const { handleCopy } = useCopyToClipboard();

  const output = useMemo(
    () =>
      generateLoremIpsum({
        asHTML,
        generationUnit,
        inputAmount,
        startWithStandard:
          generationUnit === "words" ? false : startWithStandard,
      }),
    [inputAmount, generationUnit, asHTML, startWithStandard, seed]
  );

  const handleAmountChange = (value: number | undefined) => {
    if (value && value > 0 && value < 100) {
      setInputAmount(value);
    }
  };

  return (
    <>
      <div className="screen-line-after flex flex-col gap-y-2 py-3">
        <Label
          className="text-muted-foreground text-xs"
          htmlFor="lorem-amount"
        >
          {UNIT_LABELS[generationUnit]}
        </Label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <InputNumber
              defaultValue={2}
              id="lorem-amount"
              max={25}
              min={1}
              onFocus={(event) => event.target.select()}
              onValueChange={handleAmountChange}
              placeholder="entrez un nombre ..."
              value={inputAmount}
            />
          </div>
          <Combobox
            className="w-42"
            data={GENERATION_OPTIONS}
            onSelect={(value: GenerationUnit) =>
              setGenerationUnit(value)
            }
            search={false}
            value={generationUnit}
          />
        </div>
      </div>

      <div className="screen-line-after flex items-center gap-3 py-3 sm:gap-6">
        <div className="flex items-center gap-x-1">
          <CheckboxAnimated
            checked={startWithStandard}
            disabled={generationUnit === "words"}
            id="standard-sentence"
            onCheckedChange={(checked: boolean) =>
              setStartWithStandard(checked)
            }
          />
          <Label
            className="cursor-pointer"
            htmlFor="standard-sentence"
          >
            lorem Ipsum en premier
          </Label>
        </div>
        <div className="flex items-center gap-x-1">
          <CheckboxAnimated
            checked={asHTML}
            id="as-html"
            onCheckedChange={(checked: boolean) => setAsHTML(checked)}
          />
          <Label className="cursor-pointer" htmlFor="as-html">
            format HTML
          </Label>
        </div>
      </div>

      <div className="screen-line-after flex flex-col gap-y-2 py-3">
        <Label
          className="text-muted-foreground text-xs"
          htmlFor="lorem-output"
        >
          texte généré
        </Label>
        <Textarea
          id="lorem-output"
          readOnly
          rows={inputAmount <= 1 ? 4 : 8}
          value={output}
        />
      </div>

      <div className="flex justify-between py-1.5">
        <Button onClick={() => handleCopy(output)} variant="outline">
          copier le texte
        </Button>
        <Button onClick={() => setSeed((prev) => prev + 1)}>
          générer le texte
        </Button>
      </div>
    </>
  );
};
