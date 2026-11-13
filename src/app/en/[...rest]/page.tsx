import { notFound } from "next/navigation";

/**
 * Attrape-tout de l'arbre anglais.
 *
 * Une URL qui ne correspond à AUCUNE route sort des deux arbres et tombe sur
 * `global-not-found.tsx`, qui est français — il sert la racine du site. Une
 * adresse inconnue sous `/en` recevait donc `<html lang="fr">` et un texte
 * français, alors que `/en/projects/inconnu`, qui correspond à une route,
 * recevait bien la page anglaise.
 *
 * Avec cette route, toute adresse sous `/en` correspond à quelque chose : le
 * `notFound()` est levé DANS l'arbre anglais et rend `en/not-found.tsx` sous
 * `en/layout.tsx`.
 *
 * Pas de `generateStaticParams`, exprès : avec lui, chaque adresse inconnue
 * demandée serait mise en cache comme une page, sans limite.
 */
const EnglishCatchAll = () => {
  notFound();
};

export default EnglishCatchAll;
