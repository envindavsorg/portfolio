import { Panel, PanelContent } from "@/components/Panel";
import GLOBAL_DATA from "@/content/data/global";
import { FlipSentences } from "@/registry/flip-sentences";
import { HeaderImage } from "./HeaderImage";
import { HeaderText } from "./HeaderText";
import { HeaderTitle } from "./HeaderTitle";

export const Header = () => (
  <Panel className="flex select-none before:bg-transparent">
    <HeaderImage
      name={GLOBAL_DATA.USER.fullName}
      photo={GLOBAL_DATA.USER.photo}
    />

    <PanelContent className="flex flex-1 flex-col p-0">
      <HeaderText message={GLOBAL_DATA.USER.welcome} />

      <HeaderTitle
        capture={process.env.ENV_TYPE === "capture"}
        name={GLOBAL_DATA.USER.fullName}
        pronunciation={GLOBAL_DATA.USER.pronunciation}
      />

      <div className="flex min-h-8 items-center border-edge border-t px-2 py-1 sm:px-4">
        <FlipSentences
          className="text-muted-foreground text-xs sm:text-sm"
          disableAnimation={process.env.ENV_TYPE === "capture"}
          sentences={GLOBAL_DATA.OVERVIEW.sentences}
        />
      </div>
    </PanelContent>
  </Panel>
);
