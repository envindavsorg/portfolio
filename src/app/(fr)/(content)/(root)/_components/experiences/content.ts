import type { Message } from "@/lib/i18n";
import * as m from "@/paraglide/messages";

export interface Experience {
  id: string;
  /**
   * Poste ou formation.
   *
   * La distinction n'était déductible que par l'ABSENCE de `skills`, de
   * `description` et de `link` : un futur poste sans puces aurait donc basculé
   * silencieusement du côté « formation » sur le CV. Ce champ la rend explicite.
   */
  kind: "job" | "education";
  company: string;
  type?: Message;
  title: Message;
  link?: string;
  period: {
    start: string;
    end?: string;
  };
  skills?: string[];
  description?: Message[];
  isCurrentEmployer?: boolean;
  /**
   * Date d'entrée, en toutes lettres, pour la page /now (« depuis le 1er avril
   * 2026 »). Les périodes du site ne portent que l'année : sans ce champ, un
   * poste commencé en cours d'année s'annonce « depuis 2026 ».
   */
  since?: Message;
}

export const EXPERIENCES: Experience[] = [
  {
    // ni missions ni stack pour l'instant : le poste vient de commencer, et
    // rien n'est écrit ici qui n'ait été dicté. Sans `description`, il n'a
    // pas de fiche propre (`experiencePages`).
    company: "Cospal",
    id: "cospal",
    isCurrentEmployer: true,
    kind: "job",
    link: "https://decleor.com/",
    period: {
      start: "2026",
    },
    since: m.home_exp_cospal_since,
    title: m.home_exp_cospal_title,
    type: m.home_exp_wefix_type,
  },
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
    isCurrentEmployer: false,
    kind: "job",
    link: "https://wefix.net/",
    period: {
      end: "2026",
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
    kind: "job",
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
    kind: "job",
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
    kind: "education",
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
    kind: "education",
    period: {
      end: "2016",
      start: "2013",
    },
    title: m.home_exp_um2_title,
  },
  {
    company: " Lycée Jean Moulin (Pézenas)",
    id: "bac-s-jean-moulin",
    kind: "education",
    period: {
      end: "2013",
      start: "2010",
    },
    title: m.home_exp_bac_title,
  },
];
