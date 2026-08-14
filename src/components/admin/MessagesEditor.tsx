"use client";

import { useMemo, useState } from "react";

import { saveMessagesAction } from "@/actions/save-messages.action";
import { Label } from "@/components/base/Label";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import type { MessageBundle } from "@/lib/admin/messages";
import {
  checkMessages,
  isBlocking,
  placeholders,
  SCHEMA_KEY,
} from "@/lib/admin/messages";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "repos" }
  | { kind: "envoi" }
  | { kind: "inchange" }
  | { kind: "enregistre"; commits: { locale: string; url: string }[] }
  | { kind: "refuse"; details: string[] }
  | { kind: "echec"; message: string };

/**
 * 627 clés : on n'affiche pas tout d'un coup.
 *
 * Une liste complète rendrait 1254 champs de saisie, ce qui pèse plus lourd que
 * n'importe quelle page publique du site — et le dépôt tient des plafonds de
 * poids. Le filtre est donc la vue par défaut, et « à traduire » est le tri
 * utile : c'est là qu'il reste du travail.
 */
const PAGE_SIZE = 40;

export const MessagesEditor = ({
  french,
  english,
}: Readonly<{ french: MessageBundle; english: MessageBundle }>) => {
  const [fr, setFr] = useState(french);
  const [en, setEn] = useState(english);
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "repos" });

  const keys = useMemo(
    () =>
      Object.keys(fr)
        .filter((key) => key !== SCHEMA_KEY)
        .sort((left, right) => left.localeCompare(right, "en")),
    [fr]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return keys.filter((key) => {
      if (onlyMissing && (en[key] ?? "").trim() !== "") {
        return false;
      }
      if (needle === "") {
        return true;
      }

      return (
        key.toLowerCase().includes(needle) ||
        (fr[key] ?? "").toLowerCase().includes(needle) ||
        (en[key] ?? "").toLowerCase().includes(needle)
      );
    });
  }, [keys, query, onlyMissing, fr, en]);

  const findings = useMemo(
    () => checkMessages(fr, en).filter(isBlocking),
    [fr, en]
  );

  const untranslated = useMemo(
    () => keys.filter((key) => (en[key] ?? "").trim() === "").length,
    [keys, en]
  );

  const handleSave = async () => {
    setStatus({ kind: "envoi" });

    const result = await saveMessagesAction({
      english: en,
      french: fr,
    });

    if (result?.serverError) {
      setStatus({ kind: "echec", message: result.serverError });
      return;
    }

    if (result?.data?.saved === false) {
      setStatus({
        details: (result.data.blocking ?? []).map(
          (finding) => `${finding.key} — ${finding.detail}`
        ),
        kind: "refuse",
      });
      return;
    }

    const commits = result?.data?.committed ?? [];

    setStatus(
      commits.length === 0
        ? { kind: "inchange" }
        : { commits, kind: "enregistre" }
    );
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-1">
        <h1 className="font-semibold text-2xl lowercase">
          traductions
        </h1>
        <p className="text-muted-foreground text-sm">
          {keys.length} clés, {untranslated} sans traduction anglaise.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-60 flex-1 flex-col gap-y-1.5">
          <Label className="text-muted-foreground text-xs lowercase">
            filtrer par clé ou par texte
          </Label>
          <Input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="home_commits, contributions ..."
            value={query}
          />
        </div>

        <Button
          onClick={() => setOnlyMissing((current) => !current)}
          variant={onlyMissing ? "default" : "outline"}
        >
          {onlyMissing
            ? "tout afficher"
            : `à traduire (${untranslated})`}
        </Button>
      </div>

      {/*
        Les signalements apparaissent PENDANT la saisie, pas seulement à
        l'enregistrement : perdre un `{count}` ne casse rien visiblement, autant
        le dire au moment où ça arrive.
      */}
      {findings.length > 0 ? (
        <div
          className="rounded-md border border-destructive p-3 text-sm"
          role="alert"
        >
          <p className="font-medium">
            {findings.length} problème
            {findings.length > 1 ? "s" : ""} à corriger avant
            d'enregistrer
          </p>
          <ul className="pt-1">
            {findings.slice(0, 8).map((finding) => (
              <li
                className="text-muted-foreground"
                key={`${finding.kind}-${finding.key}`}
              >
                <span className="font-mono text-xs">
                  {finding.key}
                </span>{" "}
                — {finding.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-muted-foreground text-sm">
        {visible.length} clé{visible.length > 1 ? "s" : ""} affichée
        {visible.length > 1 ? "s" : ""}
        {visible.length > PAGE_SIZE ? `, ${PAGE_SIZE} premières` : ""}
      </p>

      <div className="flex flex-col gap-y-4">
        {visible.slice(0, PAGE_SIZE).map((key) => {
          const expected = placeholders(fr[key] ?? "");
          const actual = placeholders(en[key] ?? "");
          const mismatch =
            expected.length > 0 &&
            expected.some((name) => !actual.includes(name));

          return (
            <div
              className={cn(
                "rounded-md border p-3",
                mismatch ? "border-destructive" : "border-input"
              )}
              key={key}
            >
              <p className="pb-2 font-mono text-muted-foreground text-xs">
                {key}
                {expected.length > 0
                  ? ` · ${expected.map((name) => `{${name}}`).join(" ")}`
                  : ""}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-y-1">
                  <Label className="text-muted-foreground text-xs">
                    français
                  </Label>
                  <textarea
                    className="min-h-16 rounded-md border border-input bg-background p-2 text-sm"
                    onChange={(event) =>
                      setFr((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    value={fr[key] ?? ""}
                  />
                </div>

                <div className="flex flex-col gap-y-1">
                  <Label className="text-muted-foreground text-xs">
                    anglais
                  </Label>
                  <textarea
                    className="min-h-16 rounded-md border border-input bg-background p-2 text-sm"
                    onChange={(event) =>
                      setEn((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    value={en[key] ?? ""}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={status.kind === "envoi" || findings.length > 0}
          onClick={handleSave}
          variant="default"
        >
          {status.kind === "envoi"
            ? "enregistrement ..."
            : "enregistrer les deux fichiers"}
        </Button>
      </div>

      {status.kind === "enregistre" ? (
        <p className="text-sm" role="alert">
          Enregistré ({status.commits.length} commit
          {status.commits.length > 1 ? "s" : ""}). Le site changera
          après le redéploiement.
          {status.commits.map((commit) => (
            <>
              {" "}
              <a
                className="underline decoration-dotted underline-offset-4"
                href={commit.url}
                key={commit.locale}
                rel="noopener noreferrer"
                target="_blank"
              >
                {commit.locale}
              </a>
            </>
          ))}
        </p>
      ) : null}

      {status.kind === "inchange" ? (
        <p className="text-muted-foreground text-sm" role="alert">
          Rien à enregistrer : les deux fichiers sont déjà exactement
          ceux-là.
        </p>
      ) : null}

      {status.kind === "refuse" ? (
        <div className="text-destructive text-sm" role="alert">
          <p>Refusé avant écriture :</p>
          <ul>
            {status.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {status.kind === "echec" ? (
        <p className="text-destructive text-sm" role="alert">
          {status.message}
        </p>
      ) : null}
    </div>
  );
};
