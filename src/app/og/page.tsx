import { Header } from "@/app/(content)/(root)/_components/header/Header";
import { Overview } from "@/app/(content)/(root)/_components/overview/Overview";
import { FooterClock } from "@/components/layout/footer/FooterClock";
import { Divider } from "@/components/primitives/Divider";

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
