/**
 * La date de mise à jour la plus récente d'un ensemble de contenus, en ISO 8601.
 *
 * Elle vivait dans `sitemap.ts`, et la page d'accueil datait son `ProfilePage`
 * avec `dayjs()` : une valeur lue à l'horloge PENDANT le rendu, qui bougeait à
 * chaque revalidation horaire sans qu'aucun contenu ne change, et contredisait
 * le `lastmod` que le sitemap donne à la même URL (14 novembre d'un côté, 12 août
 * de l'autre). Les deux lisent maintenant cette fonction.
 *
 * `getAllContent` trie par `createdAt` : le premier élément n'est pas forcément
 * le plus récemment mis à jour, d'où le maximum. Une liste vide ne rend rien —
 * c'est à l'appelant de décider quoi dire quand il n'y a rien à dater.
 */
export const latestUpdate = (
  posts: { metadata: { updatedAt: Date | string } }[]
): string | undefined => {
  if (posts.length === 0) {
    return;
  }

  const latest = Math.max(
    ...posts.map((post) =>
      new Date(post.metadata.updatedAt).getTime()
    )
  );

  return new Date(latest).toISOString();
};
