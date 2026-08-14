"use client";

import Link from "next/link";
import { useState } from "react";

import { saveContentAction } from "@/actions/save-content.action";
import { Label } from "@/components/base/Label";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";

import { contentPublicPath } from "@/lib/admin/paths";

export interface EditorValues {
  slug: string;
  category: "articles" | "components" | "utils";
  locale: "fr" | "en";
  title: string;
  description: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  image: string;
  cover: string;
  series: string;
  seriesName: string;
  seriesOrder?: number;
  sha?: string;
}

type Status =
  | { kind: "repos" }
  | { kind: "envoi" }
  | { kind: "inchange" }
  | { kind: "enregistre"; commitUrl?: string }
  | { kind: "echec"; message: string };

const Field = ({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) => (
  <div className="flex flex-col gap-y-1.5">
    <Label className="text-muted-foreground text-xs lowercase">
      {label}
    </Label>
    {children}
  </div>
);

export const ContentEditor = ({
  initial,
  isNew,
}: Readonly<{ initial: EditorValues; isNew: boolean }>) => {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<Status>({ kind: "repos" });

  const set = <K extends keyof EditorValues>(
    key: K,
    value: EditorValues[K]
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setStatus({ kind: "envoi" });

    const result = await saveContentAction({
      author: values.author || undefined,
      body: values.body,
      category: values.category,
      cover: values.cover || undefined,
      createdAt: values.createdAt,
      description: values.description,
      image: values.image || undefined,
      locale: values.locale,
      series: values.series || undefined,
      seriesName: values.seriesName || undefined,
      seriesOrder: values.seriesOrder,
      sha: values.sha,
      slug: values.slug,
      tags: values.tags,
      title: values.title,
      updatedAt: values.updatedAt,
    });

    if (result?.serverError || result?.validationErrors) {
      setStatus({
        kind: "echec",
        message:
          result.serverError ??
          "les champs ne sont pas valides, vérifiez le titre et la description",
      });
      return;
    }

    if (result?.data?.changed === false) {
      setStatus({ kind: "inchange" });
      return;
    }

    setStatus({
      commitUrl: result?.data?.commitUrl,
      kind: "enregistre",
    });
  };

  const publicPath = contentPublicPath({
    category: values.category,
    locale: values.locale,
    slug: values.slug,
  });

  return (
    <form className="flex flex-col gap-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-y-1">
        <h1 className="font-semibold text-2xl lowercase">
          {isNew ? "créer" : "éditer"} · {values.slug}
        </h1>
        <p className="text-muted-foreground text-sm">
          {values.category} · {values.locale}
          {publicPath ? ` · ${publicPath}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="titre">
          <Input
            onChange={(event) => set("title", event.target.value)}
            required
            value={values.title}
          />
        </Field>

        <Field label="étiquettes (séparées par des virgules)">
          <Input
            onChange={(event) =>
              set(
                "tags",
                event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              )
            }
            value={values.tags.join(", ")}
          />
        </Field>
      </div>

      <Field label="description">
        <textarea
          className="min-h-20 rounded-md border border-input bg-background p-3 text-sm"
          onChange={(event) => set("description", event.target.value)}
          required
          value={values.description}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="créé le">
          <Input
            onChange={(event) => set("createdAt", event.target.value)}
            type="date"
            value={values.createdAt}
          />
        </Field>

        <Field label="mis à jour le">
          <Input
            onChange={(event) => set("updatedAt", event.target.value)}
            type="date"
            value={values.updatedAt}
          />
        </Field>

        <Field label="auteur">
          <Input
            onChange={(event) => set("author", event.target.value)}
            value={values.author}
          />
        </Field>
      </div>

      <Field label="corps (MDX)">
        <textarea
          className="min-h-[28rem] rounded-md border border-input bg-background p-3 font-mono text-sm"
          onChange={(event) => set("body", event.target.value)}
          spellCheck={false}
          value={values.body}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={status.kind === "envoi"}
          type="submit"
          variant="default"
        >
          {status.kind === "envoi"
            ? "enregistrement ..."
            : "enregistrer"}
        </Button>

        <Link
          className="text-muted-foreground text-sm underline decoration-dotted underline-offset-4 hover:text-foreground"
          href="/admin/content"
        >
          retour à la liste
        </Link>
      </div>

      {/*
        On DIT que la mise en ligne n'est pas immédiate. Les MDX sont lus au
        build : laisser croire à une mise à jour instantanée ferait recharger la
        page publique en boucle pour rien.
      */}
      {status.kind === "enregistre" ? (
        <p className="text-sm" role="alert">
          Enregistré. La page publique changera après le
          redéploiement, dans deux minutes environ.
          {status.commitUrl ? (
            <>
              {" "}
              <a
                className="underline decoration-dotted underline-offset-4"
                href={status.commitUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                voir le commit
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {status.kind === "inchange" ? (
        <p className="text-muted-foreground text-sm" role="alert">
          Rien à enregistrer : le fichier est déjà exactement
          celui-là.
        </p>
      ) : null}

      {status.kind === "echec" ? (
        <p className="text-destructive text-sm" role="alert">
          {status.message}
        </p>
      ) : null}
    </form>
  );
};
