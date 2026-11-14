/**
 * Nom accessible d'un contrôle dont le texte affiché ne dit pas, seul, où il
 * mène : « voir la certification », « lire l'article », « EN ».
 *
 * `aria-label` REMPLACE le contenu, il ne s'y ajoute pas. Tant que le libellé
 * ne reprenait pas les mots affichés — le titre de la certification à la place
 * de « voir la certification », un nom de fichier à la place de « voir et
 * télécharger » —, une personne qui pilote son navigateur à la voix et dicte ce
 * qu'elle lit n'activait rien : WCAG 2.5.3, niveau A. Le texte visible passe
 * donc en tête, tel quel, et la précision suit.
 *
 * Construit ici plutôt que tiré d'un second message Paraglide : deux chaînes
 * traduites séparément finissent par diverger, et c'est exactement cet écart
 * que la règle interdit (« voir tous mes articles » affiché, « Voir tous les
 * articles » annoncé). Une seule source pour les mots visibles, et le nom ne
 * peut plus les perdre.
 */
export const accessibleName = (
  visible: string,
  detail: string
): string => `${visible} — ${detail}`;
