import { getGitHubData } from "@/actions/data.action";
import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import { Badge } from "@/components/primitives/Badge";
import { Prose } from "@/components/primitives/Typography";
import {
  aggregateLanguages,
  getContributionStats,
} from "@/lib/github-stats";
import * as m from "@/paraglide/messages";

import { ROW_META } from "../shared/row";
import { CommitsContent } from "./CommitsContent";
import { CommitsLanguages } from "./CommitsLanguages";
import { CommitsStats } from "./CommitsStats";

export const Commits = async () => {
  const { stars, followers, following, contributions, repositories } =
    await getGitHubData();

  const stats = getContributionStats(contributions);
  const languages = aggregateLanguages(repositories);

  return (
    <Panel>
      <PanelHeader sticky title={m.home_commits_panel_title()} />

      <PanelContent>
        <Prose>{m.home_commits_prose_1()}</Prose>
        <Prose>{m.home_commits_prose_2()}</Prose>
      </PanelContent>

      <CommitsContent contributions={contributions} />

      <CommitsStats stats={stats} />

      <CommitsLanguages languages={languages} />

      <div className={ROW_META}>
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
