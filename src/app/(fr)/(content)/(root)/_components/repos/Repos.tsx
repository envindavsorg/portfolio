import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";

import { getGitHubData } from "@/actions/data.action";
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from "@/components/base/Panel";
import { Button } from "@/components/primitives/Button";
import { Prose } from "@/components/primitives/Typography";
import GLOBAL_DATA from "@/data/global";
import { selectRepos } from "@/lib/repos";
import { m } from "@/paraglide/messages";

import { RepoCard } from "./RepoCard";

/**
 * Les dépôts publics, en direct.
 *
 * La section AFFICHE son indisponibilité au lieu de disparaître. Rendre `null`
 * quand l'API ne répond pas semblait plus propre, mais la page d'accueil
 * intercale ses séparateurs entre les sections : une section absente laissait
 * deux traits collés, c'est-à-dire un trou visible que personne ne peut
 * expliquer. Et surtout, un lecteur qui connaît la section la croirait
 * supprimée. Ici, le repli dit ce qui se passe et donne le lien vers le profil,
 * qui reste la réponse à la question posée.
 *
 * Ce repli n'est pas théorique : c'est l'état de la section pendant les tests
 * de bout en bout, où le jeton GitHub est un remplaçant sans valeur. C'est donc
 * le seul des deux états que l'intégration continue peut vraiment vérifier.
 *
 * `getGitHubData()` est appelé ici ET dans la section des statistiques, qui rend
 * en parallèle : sur un cache froid, la régénération horaire de la page fait donc
 * deux appels GraphQL identiques au lieu d'un. C'est assumé — dédupliquer
 * demanderait soit de faire passer les données par un parent commun, ce qui
 * sérialiserait deux sections aujourd'hui indépendantes, soit une couche de plus
 * autour d'une action serveur. Deux requêtes par heure sur un quota de 5000
 * points ne justifient ni l'un ni l'autre.
 */
export const Repos = async () => {
  const { repositories } = await getGitHubData();
  const repos = selectRepos(repositories);

  return (
    <Panel id="my-repos">
      <PanelHeader sticky title={m.home_repos_panel_title()} />

      <PanelContent>
        <Prose>{m.home_repos_prose_1()}</Prose>
        {/* la seconde ligne décrit l'ORDRE des cartes : l'afficher au-dessus du
          repli annoncerait le classement d'une liste absente */}
        {repos.length > 0 && <Prose>{m.home_repos_prose_2()}</Prose>}
      </PanelContent>

      {repos.length > 0 ? (
        <ul
          className="screen-line-before grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
          data-slot="repo-cards"
        >
          {repos.map((repo) => (
            <li className="flex" key={repo.name}>
              <RepoCard repo={repo} />
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="screen-line-before px-2 py-3 sm:px-4"
          data-slot="repos-unavailable"
        >
          <Prose>{m.home_repos_unavailable()}</Prose>
        </div>
      )}

      <PanelFooter>
        <Button asChild variant="outline">
          <a
            href={GLOBAL_DATA.SOCIAL.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            {m.home_repos_profile_link()}
            <ArrowSquareOutIcon aria-hidden="true" />
          </a>
        </Button>
      </PanelFooter>
    </Panel>
  );
};
