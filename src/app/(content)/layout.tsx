import type React from "react";
import { Particles } from "@/components/animations/Particles";
import { NavBar } from "@/features/(navigation)/navbar/NavBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: Readonly<AppLayoutProps>) => (
  <>
    <NavBar />

    <main className="max-w-screen overflow-x-hidden px-2">{children}</main>

    {/*<Footer />*/}

    <Particles density={150} />
  </>
);

export default AppLayout;
