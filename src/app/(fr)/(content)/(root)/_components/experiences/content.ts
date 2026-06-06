import { m } from "@/paraglide/messages";

export interface Experience {
  id: string;
  company: string;
  type?: () => string;
  title: () => string;
  link?: string;
  period: {
    start: string;
    end?: string;
  };
  skills?: string[];
  description?: (() => string)[];
  isCurrentEmployer?: boolean;
}

export const EXPERIENCES: Experience[] = [
  {
    company: "WeFix by Fnac",
    description: [
      m.home_exp_wefix_desc_1,
      m.home_exp_wefix_desc_2,
      m.home_exp_wefix_desc_3,
      m.home_exp_wefix_desc_4,
      m.home_exp_wefix_desc_5,
      m.home_exp_wefix_desc_6,
      m.home_exp_wefix_desc_7,
      m.home_exp_wefix_desc_8,
    ],
    id: "wefix-by-fnac",
    isCurrentEmployer: true,
    link: "https://wefix.net/",
    period: {
      start: "2020",
    },
    skills: [
      "React",
      "Next.js",
      "Redux",
      "TypeScript",
      "Tailwind.css",
      "HTML5",
      "CSS3",
      "Git",
      "UX/UI",
      "Figma",
      "Sketch",
      "Design System",
      "Prototyping",
      "Wireframes",
      "Usability Testing",
    ],
    title: m.home_exp_wefix_title,
    type: m.home_exp_wefix_type,
  },
  {
    company: "SpinalCom",
    description: [
      m.home_exp_spinalcom_desc_1,
      m.home_exp_spinalcom_desc_2,
      m.home_exp_spinalcom_desc_3,
      m.home_exp_spinalcom_desc_4,
    ],
    id: "spinalcom",
    isCurrentEmployer: false,
    link: "https://www.spinalcom.com/",
    period: {
      end: "2020",
      start: "2019",
    },
    skills: [
      "Vue.js",
      "Nuxt.js",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Git",
      "Figma",
      "Photoshop",
      "Wireframes",
      "Prototyping",
    ],
    title: m.home_exp_spinalcom_title,
    type: m.home_exp_spinalcom_type,
  },
  {
    company: "Économat des Armées",
    description: [
      m.home_exp_economat_desc_1,
      m.home_exp_economat_desc_2,
      m.home_exp_economat_desc_3,
      m.home_exp_economat_desc_4,
    ],
    id: "economat-des-armees",
    isCurrentEmployer: false,
    link: "https://www.economat-armees.com/",
    period: {
      end: "2019",
      start: "2017",
    },
    skills: [
      "JavaScript",
      "HTML5",
      "CSS3",
      "Git",
      "Figma",
      "Python",
      "Django",
      "Flask",
      "APIs",
    ],
    title: m.home_exp_economat_title,
    type: m.home_exp_spinalcom_type,
  },
  {
    company: "ETNA (École des Technologies Numériques Avancées)",
    id: "etna-master",
    period: {
      end: "2020",
      start: "2016",
    },
    title: m.home_exp_etna_title,
  },
  {
    company:
      "Licence Scientifique - Université des Sciences UM2 Montpellier",
    id: "um2-licence",
    period: {
      end: "2016",
      start: "2013",
    },
    title: m.home_exp_um2_title,
  },
  {
    company: " Lycée Jean Moulin (Pézenas)",
    id: "bac-s-jean-moulin",
    period: {
      end: "2013",
      start: "2010",
    },
    title: m.home_exp_bac_title,
  },
];
