/**
 * Les états d'un titre de section collant, sans DOM ni horloge.
 *
 * Deux choses bougent indépendamment : la FORME (« titre » au repos,
 * « -- titre -- » une fois collé) et l'ENTRÉE (le titre a-t-il déjà été vu).
 * Les mêler dans le composant, c'est retrouver les titres absents que ce dépôt
 * a déjà connus ; ici chaque transition est écrite une fois, et testée.
 */

export type TitleForm = "plain" | "stuck";

/**
 * - `static` : l'état du HTML servi, lettres visibles, rien d'animé ;
 * - `armed` : hors écran au premier constat, lettres masquées, l'entrée attend ;
 * - `live` : le titre a joué (ou joue) une animation.
 */
type TitlePhase = "static" | "armed" | "live";

export interface TitleState {
  /** la forme en train de sortir, encore montée le temps de son fondu */
  exiting: TitleForm | null;
  phase: TitlePhase;
  stuck: boolean;
}

export type TitleEvent =
  /** premier constat de l'observateur : le titre est hors écran */
  | { type: "arm" }
  /** le titre entre à l'écran */
  | { type: "enter" }
  /** la forme sortante a fini son fondu */
  | { type: "exited" }
  /** le titre passe au-dessus ou repasse sous la ligne d'accroche */
  | { stuck: boolean; type: "stick" };

export const INITIAL_TITLE: TitleState = {
  exiting: null,
  phase: "static",
  stuck: false,
};

export const titleForm = (stuck: boolean): TitleForm =>
  stuck ? "stuck" : "plain";

export const titleReducer = (
  state: TitleState,
  event: TitleEvent
): TitleState => {
  switch (event.type) {
    case "arm": {
      // Seul un titre encore dans son état servi se laisse masquer : un titre
      // déjà vu qui ressort du cadre ne rejoue pas son entrée au retour.
      return state.phase === "static"
        ? { ...state, phase: "armed" }
        : state;
    }
    case "enter": {
      return state.phase === "armed"
        ? { ...state, phase: "live" }
        : state;
    }
    case "exited": {
      return state.exiting ? { ...state, exiting: null } : state;
    }
    case "stick": {
      if (event.stuck === state.stuck) {
        return state;
      }

      // Hors écran et jamais vu, le changement de forme est muet : personne
      // ne regarde, donc aucune copie sortante à animer.
      if (state.phase === "armed") {
        return { ...state, exiting: null, stuck: event.stuck };
      }

      return {
        exiting: titleForm(state.stuck),
        phase: "live",
        stuck: event.stuck,
      };
    }
    default: {
      return state;
    }
  }
};
