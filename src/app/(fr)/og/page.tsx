import type { Metadata } from "next";

import { Header } from "@/app/(fr)/(content)/(root)/_components/header/Header";
import { Overview } from "@/app/(fr)/(content)/(root)/_components/overview/Overview";
import { Divider } from "@/components/base/Divider";
import { FooterClock } from "@/components/layout/footer/FooterClock";

// page de capture interne (src/scripts/capture.ts) — à ne pas indexer
export const metadata: Metadata = {
  robots: { follow: false, index: false },
};

const Page = () => (
  <div className="mx-auto flex h-screen flex-col justify-center px-2 md:max-w-3xl">
    <Divider type="half" />
    <Header capture />
    <Divider type="half" />
    <Overview />
    <Divider after={false} type="half" />
    <FooterClock isActionnable={false} />
    <Divider before={false} type="half" />
  </div>
);

export default Page;
