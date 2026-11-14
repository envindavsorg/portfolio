import type { LanguageShare } from "@/lib/github-stats";
import * as m from "@/paraglide/messages";

interface CommitsLanguagesProps {
  languages: LanguageShare[];
}

/**
 * Répartition des langages, agrégée sur les dépôts publics non forkés.
 *
 * La barre est décorative : la même information est disponible en texte juste
 * en dessous, donc elle est masquée aux technologies d'assistance plutôt que
 * dupliquée à l'oral.
 */
export const CommitsLanguages = ({
  languages,
}: CommitsLanguagesProps) => {
  if (languages.length === 0) {
    return null;
  }

  return (
    <div className="screen-line-before flex flex-col gap-y-2 p-3">
      <p className="text-muted-foreground text-xs lowercase">
        {m.home_commits_languages_title()}
      </p>

      <div
        aria-hidden="true"
        className="flex h-2 w-full overflow-hidden bg-accent"
      >
        {languages.map((language) => (
          <span
            key={language.name}
            style={{
              backgroundColor: language.color,
              width: `${language.percent}%`,
            }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {languages.map((language) => (
          <li
            className="flex items-center gap-x-1.5 text-xs"
            key={language.name}
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0"
              style={{ backgroundColor: language.color }}
            />
            <span className="font-medium">{language.name}</span>
            <span className="text-muted-foreground">
              {language.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
