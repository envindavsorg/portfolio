import { PanelContent } from "../base/Panel";
import { PixelHeading } from "../blocks/PixelHeading";
import { Prose } from "../primitives/Typography";

interface WritingsHeadingProps {
  title: string;
  description: string;
}

export const WritingsHeading = ({
  title,
  description,
}: WritingsHeadingProps) => (
  <>
    {/* Mêmes classes que le h1 des sept autres types de page d'écrits. Celui-ci
        seul était en couleur d'accent (`text-theme`) et sans graisse : /utils
        et les pages d'outil avaient un titre pêche — ou bleu — quand articles,
        composants, sujets et séries l'ont dans la couleur du texte.
        `select-text` : c'est le titre d'un contenu, on doit pouvoir le copier ;
        `PixelHeading` pose `select-none` par défaut. */}
    <PixelHeading
      autoPlay
      className="select-text text-balance px-3 py-1 font-extrabold text-[28px] leading-snug sm:text-4xl"
      mode="multi"
    >
      {title}
    </PixelHeading>
    <PanelContent reset className="screen-line-before px-3 py-1.5">
      <Prose>-- {description} --</Prose>
    </PanelContent>
  </>
);
