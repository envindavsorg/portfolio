"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { Label } from "@/components/base/Label";
import { Button, CopyButton } from "@/components/primitives/Button";
import { Textarea } from "@/components/primitives/Textarea";
import type { HashAlgorithm } from "@/lib/hash";
import {
  digest,
  HASH_ALGORITHMS,
  isHashAlgorithm,
  randomUuid,
} from "@/lib/hash";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

export const HashGenerator = () => {
  const [text, setText] = useState("");
  const [algorithm, setAlgorithm] =
    useState<HashAlgorithm>("SHA-256");
  const [hash, setHash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uuids, setUuids] = useState<string[]>([]);

  useEffect(() => {
    if (!text) {
      setHash("");
      setError(null);
      return;
    }

    // le calcul est asynchrone : on ignore le résultat si l'entrée a changé
    // entre-temps, sinon une frappe rapide peut afficher une empreinte périmée
    let cancelled = false;

    const compute = async () => {
      try {
        const result = await digest(text, algorithm);
        if (!cancelled) {
          setHash(result);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setHash("");
          setError(m.utils_hash_error());
        }
      }
    };

    void compute();

    return () => {
      cancelled = true;
    };
  }, [text, algorithm]);

  const handleText = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setText(event.target.value);

  const handleGenerateUuids = useCallback(() => {
    setUuids(Array.from({ length: 5 }, () => randomUuid()));
  }, []);

  return (
    <div className="flex w-full flex-col gap-y-6 py-4">
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="hash-input">
          {m.utils_hash_input_label()}
        </Label>
        <Textarea
          className="min-h-24 font-mono text-xs"
          id="hash-input"
          onChange={handleText}
          placeholder={m.utils_hash_input_placeholder()}
          spellCheck={false}
          value={text}
        />

        <div
          aria-label={m.utils_hash_algorithm_label()}
          className="flex flex-wrap gap-2"
          role="group"
        >
          {HASH_ALGORITHMS.map((option) => (
            <Button
              aria-pressed={algorithm === option}
              className={cn(
                algorithm === option && "border-theme text-theme"
              )}
              key={option}
              onClick={(event) => {
                const { value } = event.currentTarget.dataset;
                if (value && isHashAlgorithm(value)) {
                  setAlgorithm(value);
                }
              }}
              data-value={option}
              size="sm"
              variant="outline"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {hash && (
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between gap-x-2">
            <Label>{m.utils_hash_result_label({ algorithm })}</Label>
            <CopyButton
              getValueAction={() => Promise.resolve(hash)}
              label={m.utils_hash_copy_aria()}
              size="icon"
              variant="outline"
            />
          </div>
          <p className="break-all rounded-md border border-input p-3 font-mono text-xs">
            {hash}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-y-2 border-input border-t pt-4">
        <div className="flex items-center justify-between gap-x-2">
          <Label>{m.utils_hash_uuid_label()}</Label>
          <Button
            onClick={handleGenerateUuids}
            size="sm"
            variant="outline"
          >
            {m.utils_hash_uuid_generate()}
          </Button>
        </div>

        {uuids.length > 0 && (
          <ul className="flex flex-col gap-y-1">
            {uuids.map((uuid) => (
              <li
                className="flex items-center justify-between gap-x-2 rounded-md border border-input px-3 py-1.5"
                key={uuid}
              >
                <span className="break-all font-mono text-xs">
                  {uuid}
                </span>
                <CopyButton
                  getValueAction={() => Promise.resolve(uuid)}
                  label={m.utils_hash_uuid_copy_aria()}
                  size="icon"
                  variant="ghost"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
