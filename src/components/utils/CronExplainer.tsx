"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import type {
  CronError,
  CronFieldName,
  FieldShape,
} from "@/lib/cron";
import {
  CRON_FIELDS,
  CRON_PRESETS,
  describeField,
  nextRuns,
  parseCron,
} from "@/lib/cron";
import { formatInZone } from "@/lib/datetime";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

const NEXT_RUN_COUNT = 5;

const FIELD_LABELS: Record<CronFieldName, () => string> = {
  dayOfMonth: m.utils_cron_field_dayOfMonth,
  dayOfWeek: m.utils_cron_field_dayOfWeek,
  hour: m.utils_cron_field_hour,
  minute: m.utils_cron_field_minute,
  month: m.utils_cron_field_month,
};

const describeShape = (shape: FieldShape): string => {
  switch (shape.kind) {
    case "every": {
      return m.utils_cron_shape_every();
    }
    case "step": {
      return m.utils_cron_shape_step({ step: shape.step });
    }
    case "single": {
      return m.utils_cron_shape_single({ value: shape.value });
    }
    default: {
      return m.utils_cron_shape_list({
        values: shape.values.join(", "),
      });
    }
  }
};

const errorMessage = (
  reason: CronError,
  field: CronFieldName | null
): string => {
  const name = field ? FIELD_LABELS[field]() : "";

  switch (reason) {
    case "field-count": {
      return m.utils_cron_error_field_count();
    }
    case "empty": {
      return m.utils_cron_error_empty();
    }
    case "unknown-value": {
      return m.utils_cron_error_unknown_value({ field: name });
    }
    case "out-of-range": {
      return m.utils_cron_error_out_of_range({ field: name });
    }
    case "reversed-range": {
      return m.utils_cron_error_reversed_range({ field: name });
    }
    default: {
      return m.utils_cron_error_bad_step({ field: name });
    }
  }
};

export const CronExplainer = () => {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  /**
   * L'instant de départ est posé après l'hydratation, pas pendant le rendu :
   * lire l'horloge en cours de rendu donnerait deux valeurs différentes côté
   * serveur et côté client, donc une erreur d'hydratation. Il reste ensuite figé,
   * sinon la liste des prochaines exécutions glisserait à chaque frappe.
   */
  const [from, setFrom] = useState<Date | null>(null);

  useEffect(() => setFrom(new Date()), []);

  const parsed = useMemo(() => parseCron(expression), [expression]);

  const runs = useMemo(() => {
    if (!(parsed.ok && from)) {
      return [];
    }
    return nextRuns(parsed.cron, from, NEXT_RUN_COUNT);
  }, [parsed, from]);

  const handleExpression = (event: ChangeEvent<HTMLInputElement>) =>
    setExpression(event.target.value);

  const handlePreset = useCallback((preset: string) => {
    setExpression(preset);
  }, []);

  const locale = getLocale() === "en" ? "en-GB" : "fr-FR";

  const bothDaysRestricted =
    parsed.ok &&
    !parsed.cron.dayOfMonth.isWildcard &&
    !parsed.cron.dayOfWeek.isWildcard;

  return (
    <div
      className="flex w-full flex-col gap-y-6 py-4"
      data-slot="utils-cron-explainer"
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="cron-input">
          {m.utils_cron_input_label()}
        </Label>
        <Input
          className="font-mono text-sm"
          id="cron-input"
          onChange={handleExpression}
          placeholder={m.utils_cron_input_placeholder()}
          spellCheck={false}
          value={expression}
        />

        <div
          aria-label={m.utils_cron_presets_label()}
          className="flex flex-wrap gap-2"
          role="group"
        >
          {CRON_PRESETS.map((preset) => (
            <Button
              key={preset}
              onClick={() => handlePreset(preset)}
              size="sm"
              variant="outline"
            >
              <span className="font-mono text-xs">{preset}</span>
            </Button>
          ))}
        </div>

        <p className="text-muted-foreground text-xs">
          {m.utils_cron_utc_notice()}
        </p>
      </div>

      {parsed.ok ? (
        <>
          <Badge className="w-fit lowercase" variant="primary">
            {m.utils_cron_valid()}
          </Badge>

          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_cron_fields_title()}</Label>
            <dl className="flex flex-col divide-y divide-input rounded-md border border-input">
              {CRON_FIELDS.map((name) => (
                <div
                  className="flex items-center justify-between gap-x-3 p-3"
                  key={name}
                >
                  <dt className="text-muted-foreground text-xs">
                    {FIELD_LABELS[name]()}
                  </dt>
                  <dd className="text-right text-xs">
                    {describeShape(
                      describeField(parsed.cron[name], name)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {bothDaysRestricted && (
            <p className="rounded-md border border-input p-3 text-xs">
              {m.utils_cron_or_notice()}
            </p>
          )}

          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_cron_next_title()}</Label>

            {/* avant l'hydratation `from` est nul et la liste est vide : afficher
                « ne se déclenchera jamais » ici serait un faux négatif */}
            {from && runs.length === 0 ? (
              <p className="text-destructive text-sm" role="alert">
                {m.utils_cron_never()}
              </p>
            ) : (
              <ol className="flex flex-col divide-y divide-input rounded-md border border-input">
                {runs.map((run) => (
                  <li
                    className="p-3 font-mono text-xs"
                    key={run.toISOString()}
                  >
                    {formatInZone(run, "UTC", locale)}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      ) : (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage(parsed.reason, parsed.field)}
        </p>
      )}
    </div>
  );
};
