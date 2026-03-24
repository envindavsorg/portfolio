import type { ComponentType } from "react";

import { NextJSIcon } from "@/components/svgs/stack/Next";
import { ReactIcon } from "@/components/svgs/stack/React";

export interface Cert {
  title: string;
  issuer: string;
  issueDate: string;
  credentialID: string;
  credentialURL: string;
  coverImageURL: string;
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const CERTS: Cert[] = [
  {
    coverImageURL:
      "/images/certs/nextjs-pages-router-fundamentals.webp",
    credentialID: "pages-router-99069-1759826128639",
    credentialURL:
      "https://nextjs.org/learn/certificate?course=pages-router&user=99069&certId=pages-router-99069-1759826128639",
    icon: NextJSIcon,
    issueDate: "2025-10-07",
    issuer: "Vercel",
    title: "Next.js Pages Router Fundamentals",
  },
  {
    coverImageURL:
      "/images/certs/nextjs-app-router-fundamentals.webp",
    credentialID: "dashboard-app-99069-1759757715131",
    credentialURL:
      "https://nextjs.org/learn/certificate?course=dashboard-app&user=99069&certId=dashboard-app-99069-1759757715131",
    icon: NextJSIcon,
    issueDate: "2025-10-06",
    issuer: "Vercel",
    title: "Next.js App Router Fundamentals",
  },
  {
    coverImageURL: "/images/certs/nextjs-seo-fundamentals.webp",
    credentialID: "seo-99069-1759756935192",
    credentialURL:
      "https://nextjs.org/learn/certificate?course=seo&user=99069&certId=seo-99069-1759756935192",
    icon: NextJSIcon,
    issueDate: "2025-10-03",
    issuer: "Vercel",
    title: "Next.js SEO Fundamentals",
  },
  {
    coverImageURL: "/images/certs/react-foundations-for-nextjs.webp",
    credentialID: "react-foundations-99069-1759825479876",
    credentialURL:
      "https://nextjs.org/learn/certificate?course=react-foundations&user=99069&certId=react-foundations-99069-1759825479876",
    icon: ReactIcon,
    issueDate: "2025-10-03",
    issuer: "Vercel",
    title: "React Foundations for Next.js",
  },
];
