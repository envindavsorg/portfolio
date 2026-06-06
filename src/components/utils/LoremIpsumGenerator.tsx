"use client";

import {
  parseAsInteger,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { Suspense, useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Button } from "@/components/primitives/Button";
import { CheckboxAnimated } from "@/components/primitives/Checkbox";
import { Combobox } from "@/components/primitives/Combobox";
import { InputNumber } from "@/components/primitives/Input";
import { Textarea } from "@/components/primitives/Textarea";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { generateLoremIpsum } from "@/lib/lorem-ipsum";
import { m } from "@/paraglide/messages";

const GENERATION_UNITS = [
  "words",
  "sentences",
  "paragraphs",
] as const;

type GenerationUnit = (typeof GENERATION_UNITS)[number];

const UNIT_LABELS: Record<GenerationUnit, () => string> = {
  paragraphs: () => m.utils_lorem_label_paragraphs(),
  sentences: () => m.utils_lorem_label_sentences(),
  words: () => m.utils_lorem_label_words(),
};

const LoremIpsumGeneratorContent = () => {
  // état synchronisé dans l'URL (nuqs) — configuration partageable
  const [inputAmount, setInputAmount] = useQueryState(
    "count",
    parseAsInteger.withDefault(2)
  );
  const [generationUnit, setGenerationUnit] = useQueryState(
    "unit",
    parseAsStringLiteral(GENERATION_UNITS).withDefault("paragraphs")
  );
  const [asHTML, setAsHTML] = useState(false);
  const [startWithStandard, setStartWithStandard] = useState(false);
  const [seed, setSeed] = useState(0);
  const { handleCopy } = useCopyToClipboard();

  const generationOptions: {
    value: GenerationUnit;
    label: string;
  }[] = useMemo(
    () => [
      {
        label: m.utils_lorem_option_paragraphs(),
        value: "paragraphs",
      },
      { label: m.utils_lorem_option_sentences(), value: "sentences" },
      { label: m.utils_lorem_option_words(), value: "words" },
    ],
    []
  );

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
          {UNIT_LABELS[generationUnit]()}
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
              placeholder={m.utils_lorem_amount_placeholder()}
              value={inputAmount}
            />
          </div>
          <Combobox
            className="w-42"
            data={generationOptions}
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
            {m.utils_lorem_start_standard_label()}
          </Label>
        </div>
        <div className="flex items-center gap-x-1">
          <CheckboxAnimated
            checked={asHTML}
            id="as-html"
            onCheckedChange={(checked: boolean) => setAsHTML(checked)}
          />
          <Label className="cursor-pointer" htmlFor="as-html">
            {m.utils_lorem_as_html_label()}
          </Label>
        </div>
      </div>

      <div className="screen-line-after flex flex-col gap-y-2 py-3">
        <Label
          className="text-muted-foreground text-xs"
          htmlFor="lorem-output"
        >
          {m.utils_lorem_output_label()}
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
          {m.utils_lorem_copy_button()}
        </Button>
        <Button onClick={() => setSeed((prev) => prev + 1)}>
          {m.utils_lorem_generate_button()}
        </Button>
      </div>
    </>
  );
};

// useQueryState (nuqs) requiert une frontière Suspense sur les pages statiques
export const LoremIpsumGenerator = () => (
  <Suspense>
    <LoremIpsumGeneratorContent />
  </Suspense>
);
