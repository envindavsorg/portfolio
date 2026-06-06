import Link from "next/link";

import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from "@/components/base/Panel";
import { Button } from "@/components/primitives/Button";
import { Prose } from "@/components/primitives/Typography";
import { getContentByCategory } from "@/lib/content";
import { dayjs } from "@/lib/functions";
import { m } from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";

import { ArticleItem } from "./ArticleItem";

export const Articles = () => {
  const articles = getContentByCategory("articles").toSorted((a, b) =>
    dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
  );

  return (
    <Panel>
      <PanelHeader sticky title={m.home_articles_panel_title()} />

      <PanelContent>
        {getLocale() === "en" ? (
          <>
            <Prose>
              -- articles drawn from real-world experience on{" "}
              <span>web development</span>: best practices,{" "}
              <span>modern patterns</span> and technical solutions
              across the <span>JavaScript</span> ecosystem --
            </Prose>
            <Prose>
              -- one simple goal: <i>document</i>, <i>share</i> and{" "}
              <i>help</i> developers facing the same challenges --
            </Prose>
          </>
        ) : (
          <>
            <Prose>
              -- des articles issus d'expériences concrètes sur le{" "}
              <span>développement web</span> : bonnes pratiques,{" "}
              <span>patterns modernes</span> et solutions techniques
              sur l'écosystème <span>JavaScript</span> --
            </Prose>
            <Prose>
              -- un objectif simple : <i>documenter</i>,{" "}
              <i>partager</i> et <i>aider</i> les développeurs qui
              rencontrent les mêmes défis --
            </Prose>
          </>
        )}
      </PanelContent>

      <div className="screen-line-before relative py-4">
        <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
          <div className="border-edge border-r" />
          <div className="border-edge border-l" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {articles.map((item) => (
            <ArticleItem article={item} key={item.slug} />
          ))}
        </div>
      </div>

      <PanelFooter>
        <Button asChild variant="outline">
          <Link
            aria-label={m.home_articles_footer_aria_label()}
            href={localizeHref("/articles")}
          >
            {m.home_articles_footer_button()}
          </Link>
        </Button>
      </PanelFooter>
    </Panel>
  );
};
