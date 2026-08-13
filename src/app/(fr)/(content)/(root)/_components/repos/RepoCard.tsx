import {
  GitForkIcon,
  StarIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/primitives/Badge";
import { Tag } from "@/components/primitives/Tag";
import { formatDate } from "@/lib/functions";
import type { RepoCard as Repo } from "@/lib/repos";
import { m } from "@/paraglide/messages";

interface RepoCardProps {
  repo: Repo;
}

/**
 * Une carte de dépôt.
 *
 * Deux choix méritent une phrase.
 *
 * 1. Le compteur d'étoiles et de forks n'est affiché QUE s'il est non nul. Sur
 *    des dépôts personnels, six cartes annonçant « 0 étoile » n'informent de
 *    rien et ajoutent du bruit à côté de ce qui compte : le nom, ce que fait le
 *    dépôt, et la date de dernière activité.
 * 2. Le nombre est toujours accompagné du MOT (« 3 étoiles », pas « ★ 3 »).
 *    L'icône est décorative et masquée aux lecteurs d'écran : elle ne porte
 *    aucune information seule, donc son contraste relève du décoratif et non du
 *    texte.
 *
 * La zone cliquable est étendue à toute la carte par un pseudo-élément sur le
 * lien du titre, plutôt qu'en enveloppant la carte dans une ancre : le nom
 * accessible du lien reste le nom du dépôt, au lieu de réciter la description,
 * les sujets et les compteurs.
 */
export const RepoCard = ({ repo }: RepoCardProps) => {
  const hasMeta =
    repo.stars > 0 ||
    repo.forks > 0 ||
    Boolean(repo.language) ||
    Boolean(repo.pushedAt);

  return (
    <article className="group relative flex flex-1 flex-col gap-y-2 rounded-xl border border-input bg-background p-4 transition-colors hover:bg-accent2 focus-within:border-theme">
      <div className="flex items-start justify-between gap-x-2">
        <h3 className="font-pixel-square text-base lowercase">
          <a
            className="after:absolute after:inset-0 after:rounded-xl group-hover:text-theme"
            href={repo.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {repo.name}
          </a>
        </h3>

        {repo.isArchived && (
          <Badge className="shrink-0">
            {m.home_repos_archived()}
          </Badge>
        )}
      </div>

      {repo.description && (
        <p className="line-clamp-2 text-muted-foreground text-sm">
          {repo.description}
        </p>
      )}

      {repo.topics.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {repo.topics.map((topic) => (
            <li className="flex" key={topic}>
              <Tag>{topic}</Tag>
            </li>
          ))}
        </ul>
      )}

      {hasMeta && (
        <ul className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs">
          {repo.language && (
            <li className="flex items-center gap-x-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: repo.language.color }}
              />
              <span className="font-medium">
                {repo.language.name}
              </span>
            </li>
          )}

          {repo.stars > 0 && (
            <li className="flex items-center gap-x-1 text-muted-foreground">
              <StarIcon aria-hidden="true" className="size-3.5" />
              {m.home_repos_stars({
                count: repo.stars,
                plural: repo.stars > 1 ? "s" : "",
              })}
            </li>
          )}

          {repo.forks > 0 && (
            <li className="flex items-center gap-x-1 text-muted-foreground">
              <GitForkIcon aria-hidden="true" className="size-3.5" />
              {m.home_repos_forks({
                count: repo.forks,
                plural: repo.forks > 1 ? "s" : "",
              })}
            </li>
          )}

          {repo.pushedAt && (
            <li className="text-muted-foreground">
              {m.home_repos_updated({
                date: formatDate(repo.pushedAt, "D MMM YYYY"),
              })}
            </li>
          )}
        </ul>
      )}
    </article>
  );
};
