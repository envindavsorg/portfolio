"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Button, CopyButton } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import type { TimestampKind } from "@/lib/datetime";
import {
  detectTimestamp,
  formatInZone,
  formatRelative,
  TIME_ZONES,
  toIsoString,
  toUnixMillis,
  toUnixSeconds,
  zoneOffset,
} from "@/lib/datetime";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

const KIND_LABELS: Partial<Record<TimestampKind, () => string>> = {
  iso: m.utils_date_kind_iso,
  "unix-millis": m.utils_date_kind_millis,
  "unix-seconds": m.utils_date_kind_seconds,
};

export const DateConverter = () => {
  const [input, setInput] = useState("");
  /**
   * L'instant de référence est posé après l'hydratation, jamais pendant le
   * rendu : lire l'horloge en cours de rendu donne deux valeurs différentes côté
   * serveur et côté client, donc une erreur d'hydratation. Il reste ensuite figé,
   * pour que l'écart affiché ne bouge pas entre deux frappes.
   */
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => setNow(new Date()), []);

  const detected = useMemo(() => detectTimestamp(input), [input]);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) =>
    setInput(event.target.value);

  const handleNow = useCallback(() => {
    const current = new Date();
    setNow(current);
    setInput(String(toUnixSeconds(current)));
  }, []);

  const handleClear = useCallback(() => setInput(""), []);

  const { date, kind } = detected;
  const locale = getLocale() === "en" ? "en-GB" : "fr-FR";

  const conversions = date
    ? [
        {
          key: "seconds",
          label: m.utils_date_format_seconds(),
          value: String(toUnixSeconds(date)),
        },
        {
          key: "millis",
          label: m.utils_date_format_millis(),
          value: String(toUnixMillis(date)),
        },
        {
          key: "iso",
          label: m.utils_date_format_iso(),
          value: toIsoString(date),
        },
      ]
    : [];

  return (
    <div
      className="flex w-full flex-col gap-y-6 py-4"
      data-slot="utils-date-converter"
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="date-input">
          {m.utils_date_input_label()}
        </Label>
        <Input
          className="font-mono text-xs"
          id="date-input"
          onChange={handleInput}
          placeholder={m.utils_date_input_placeholder()}
          spellCheck={false}
          value={input}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleNow} size="sm" variant="outline">
            {m.utils_date_now()}
          </Button>
          <Button onClick={handleClear} size="sm" variant="outline">
            {m.utils_date_clear()}
          </Button>

          {date && (
            <span className="text-muted-foreground text-xs">
              {m.utils_date_detected({
                kind: KIND_LABELS[kind]?.() ?? kind,
              })}
            </span>
          )}
        </div>
      </div>

      {input.trim() && !date && (
        <p className="text-destructive text-sm" role="alert">
          {m.utils_date_error()}
        </p>
      )}

      {date && (
        <>
          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_date_formats_title()}</Label>
            <dl className="flex flex-col divide-y divide-input rounded-md border border-input">
              {conversions.map(({ key, label, value }) => (
                <div
                  className="flex items-center justify-between gap-x-2 p-3"
                  key={key}
                >
                  <dt className="text-muted-foreground text-xs">
                    {label}
                  </dt>
                  <dd className="flex items-center gap-x-2">
                    <span className="break-all font-mono text-xs">
                      {value}
                    </span>
                    <CopyButton
                      getValueAction={() => Promise.resolve(value)}
                      label={m.utils_date_copy_aria({ label })}
                      size="icon"
                      variant="ghost"
                    />
                  </dd>
                </div>
              ))}

              {now && (
                <div className="flex items-center justify-between gap-x-2 p-3">
                  <dt className="text-muted-foreground text-xs">
                    {m.utils_date_format_relative()}
                  </dt>
                  <dd className="font-mono text-xs">
                    {formatRelative(date, now, locale)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_date_zones_title()}</Label>
            <dl className="flex flex-col divide-y divide-input rounded-md border border-input">
              {TIME_ZONES.map((zone) => (
                <div
                  className="flex flex-col gap-y-0.5 p-3 sm:flex-row sm:items-center sm:justify-between"
                  key={zone}
                >
                  <dt className="text-muted-foreground text-xs">
                    {zone}
                    <span className="ps-2">
                      {m.utils_date_zone_offset({
                        offset: zoneOffset(date, zone),
                      })}
                    </span>
                  </dt>
                  <dd className="font-mono text-xs">
                    {formatInZone(date, zone, locale)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}
    </div>
  );
};
