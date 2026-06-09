import type React from "react";

import { Particles } from "@/components/blocks/Particles";
import { BackToTop } from "@/components/features/BackToTop";
import { KonamiConfetti } from "@/components/features/KonamiConfetti";
import { Footer } from "@/components/layout/footer/Footer";
import { NavBar } from "@/components/layout/navbar/NavBar";
import { m } from "@/paraglide/messages";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: Readonly<AppLayoutProps>) => (
  <>
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-foreground focus:text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2"
      href="#main"
    >
      {m.skip_to_content()}
    </a>

    <NavBar />
    <main
      className="max-w-screen overflow-x-clip px-2 lowercase"
      id="main"
    >
      {children}
    </main>
    <Footer />

    <BackToTop />
    <KonamiConfetti />

    <Particles density={80} />
  </>
);

export default AppLayout;
