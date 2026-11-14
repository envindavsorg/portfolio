import { describe, expect, it } from "vitest";

import type { TitleState } from "@/lib/sticky-title";
import {
  INITIAL_TITLE,
  titleForm,
  titleReducer,
} from "@/lib/sticky-title";

describe("titleForm", () => {
  it("nomme la forme d'après la position", () => {
    expect(titleForm(false)).toBe("plain");
    expect(titleForm(true)).toBe("stuck");
  });
});

describe("titleReducer", () => {
  it("part de l'état servi : visible, au repos, rien qui sort", () => {
    expect(INITIAL_TITLE).toEqual({
      exiting: null,
      phase: "static",
      stuck: false,
    });
  });

  it("masque un titre hors écran, puis le fait entrer une seule fois", () => {
    const armed = titleReducer(INITIAL_TITLE, { type: "arm" });
    expect(armed.phase).toBe("armed");

    const live = titleReducer(armed, { type: "enter" });
    expect(live.phase).toBe("live");

    // ressorti du cadre puis revenu : ni masqué de nouveau, ni rejoué
    expect(titleReducer(live, { type: "arm" })).toBe(live);
    expect(titleReducer(live, { type: "enter" })).toBe(live);
  });

  it("laisse tel quel un titre déjà à l'écran au premier constat", () => {
    expect(titleReducer(INITIAL_TITLE, { type: "enter" })).toBe(
      INITIAL_TITLE
    );
  });

  it("fait sortir la forme au repos quand le titre se colle", () => {
    expect(
      titleReducer(INITIAL_TITLE, { stuck: true, type: "stick" })
    ).toEqual({ exiting: "plain", phase: "live", stuck: true });
  });

  it("fait sortir la forme collée quand le titre se décolle", () => {
    const stuck: TitleState = {
      exiting: null,
      phase: "live",
      stuck: true,
    };

    expect(
      titleReducer(stuck, { stuck: false, type: "stick" })
    ).toEqual({ exiting: "stuck", phase: "live", stuck: false });
  });

  it("ne rend pas un nouvel état pour une position inchangée", () => {
    expect(
      titleReducer(INITIAL_TITLE, { stuck: false, type: "stick" })
    ).toBe(INITIAL_TITLE);
  });

  it("change de forme sans rien animer tant que le titre n'a pas été vu", () => {
    const armed: TitleState = {
      exiting: null,
      phase: "armed",
      stuck: false,
    };

    expect(
      titleReducer(armed, { stuck: true, type: "stick" })
    ).toEqual({ exiting: null, phase: "armed", stuck: true });
  });

  it("revient sur ses pas avant la fin du fondu : les rôles s'échangent", () => {
    const leaving: TitleState = {
      exiting: "plain",
      phase: "live",
      stuck: true,
    };

    expect(
      titleReducer(leaving, { stuck: false, type: "stick" })
    ).toEqual({ exiting: "stuck", phase: "live", stuck: false });
  });

  it("retire la forme sortante à la fin de son fondu", () => {
    const leaving: TitleState = {
      exiting: "plain",
      phase: "live",
      stuck: true,
    };

    expect(titleReducer(leaving, { type: "exited" })).toEqual({
      exiting: null,
      phase: "live",
      stuck: true,
    });

    const settled = titleReducer(leaving, { type: "exited" });
    expect(titleReducer(settled, { type: "exited" })).toBe(settled);
  });
});
