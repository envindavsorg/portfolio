import Link from "next/link";

import { Divider } from "@/components/base/Divider";
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@/components/base/Panel";
import { Particles } from "@/components/blocks/Particles";
import { TextAnimate } from "@/components/blocks/TextAnimate";
import { Button } from "@/components/primitives/Button";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

export const NotFoundContent = () => (
  <div className="mx-auto flex h-screen flex-col justify-center md:max-w-3xl">
    <Divider border={false} type="half" />

    <Panel>
      <PanelHeader>
        <PanelTitle>
          <TextAnimate
            animation="slideLeft"
            by="character"
            className="text-4xl! sm:text-5xl!"
            delay={0.2}
          >
            {m.notfound_title()}
          </TextAnimate>
        </PanelTitle>
      </PanelHeader>

      <Divider before={false} border={false} type="half" />

      <PanelContent>
        <TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
          {m.notfound_reason()}
        </TextAnimate>

        <Divider border={false} type="half" />

        <TextAnimate
          animation="slideUp"
          as="p"
          by="word"
          delay={0.6}
          themed
        >
          {m.notfound_advice()}
        </TextAnimate>
      </PanelContent>

      <PanelFooter>
        <Button asChild variant="outline">
          <Link
            aria-label={m.notfound_back_aria()}
            href={localizeHref("/")}
          >
            {m.notfound_back_label()}
          </Link>
        </Button>
      </PanelFooter>
    </Panel>

    <Divider border={false} type="half" />

    <Particles density={150} />
  </div>
);
