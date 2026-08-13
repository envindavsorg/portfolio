import type { Content } from "@/lib/content";
import { formatDate } from "@/lib/functions";
import { m } from "@/paraglide/messages";

interface WritingsBylineProps {
  item: Content;
  /**
   * Les pages /utils affichent déjà leur description dans `WritingsHeading` :
   * la répéter ici la ferait apparaître deux fois à trois lignes d'intervalle.
   */
  withDescription?: boolean;
}

/**
 * Les informations d'un contenu : description, dates, temps de lecture.
 *
 * Une page d'article n'affichait que son titre. Ni date de publication, ni date
 * de mise à jour, ni temps de lecture — et pas même la description du
 * frontmatter, pourtant écrite pour chaque contenu et servie aux moteurs dans
 * les métadonnées.
 *
 * Rien de tout cela n'était à calculer : `reading: { time, words }` est produit
 * par `src/lib/content.ts` à la lecture du fichier puis jeté, et le JSON-LD
 * publie déjà `datePublished` et `dateModified`. L'information était donc
 * lisible par une machine et par personne d'autre. Les clés Paraglide
 * existaient elles aussi, dans les deux locales.
 *
 * Composant serveur : aucune donnée supplémentaire, aucun JavaScript côté client.
 */
export const WritingsByline = ({
  item,
  withDescription = true,
}: WritingsBylineProps) => {
  const { description, createdAt, updatedAt } = item.metadata;
  const { time, words } = item.reading;

  // comparaison au jour près : `updatedAt` vaut la date de création tant que le
  // contenu n'a pas été retouché, et afficher « mis à jour le » avec la même
  // date que la publication laisse croire à une révision qui n'a pas eu lieu
  const isUpdated =
    formatDate(updatedAt, "YYYY-MM-DD") !==
    formatDate(createdAt, "YYYY-MM-DD");

  return (
    <div
      className="screen-line-after flex flex-col gap-y-2 px-2 py-3 sm:px-4"
      data-slot="writings-byline"
    >
      {withDescription && description && (
        <p className="text-pretty text-muted-foreground">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
        {/* <time> et non un <span> : la date reste lisible par une machine, et
            le format lisible par un humain est celui de la locale courante */}
        <time dateTime={createdAt.toISOString()}>
          {m.writings_article_written_on({
            date: formatDate(createdAt, "LL"),
          })}
        </time>

        {isUpdated && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              {m.writings_article_updated_label()}{" "}
              <time dateTime={updatedAt.toISOString()}>
                {formatDate(updatedAt, "LL")}
              </time>
            </span>
          </>
        )}

        <span aria-hidden="true">·</span>
        <span>
          {m.writings_article_reading_time_label()} {time}
        </span>

        <span aria-hidden="true">·</span>
        <span>{m.writings_article_words_count({ words })}</span>
      </div>
    </div>
  );
};
