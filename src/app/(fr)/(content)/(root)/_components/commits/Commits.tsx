import { getGitHubData } from "@/actions/data.action";
import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import { Badge } from "@/components/primitives/Badge";
import { Prose } from "@/components/primitives/Typography";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { CommitsContent } from "./CommitsContent";

export const Commits = async () => {
  const { stars, followers, following, contributions } =
    await getGitHubData();

  return (
    <Panel>
      <PanelHeader sticky title={m.home_commits_panel_title()} />

      <PanelContent>
        {getLocale() === "en" ? (
          <>
            <Prose>
              -- find here <span>the complete history</span> of my
              open source contributions on GitHub --
            </Prose>
            <Prose>
              -- each commit represents a <i>step</i> in my journey as
              a developer --
            </Prose>
          </>
        ) : (
          <>
            <Prose>
              -- retrouvez ici <span>l'historique complet</span> de
              mes contributions open source sur GitHub --
            </Prose>
            <Prose>
              -- chaque commit représente une <i>étape</i> de mon
              parcours en tant que développeur --
            </Prose>
          </>
        )}
      </PanelContent>

      <CommitsContent contributions={contributions} />

      <div className="screen-line-before flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
        <span className="text-theme">---</span>
        <div className="flex items-center gap-2 sm:gap-4">
          <Badge className="text-theme lowercase">
            {m.home_commits_badge_stars({ stars })}
          </Badge>
          <Badge className="text-theme lowercase">
            {m.home_commits_badge_following({ following })}
          </Badge>
          <Badge className="text-theme lowercase">
            {m.home_commits_badge_followers({ followers })}
          </Badge>
        </div>
      </div>
    </Panel>
  );
};
