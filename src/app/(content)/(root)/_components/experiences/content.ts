export interface Experience {
  id: string;
  company: string;
  type?: string;
  title: string;
  link?: string;
  period: {
    start: string;
    end?: string;
  };
  skills?: string[];
  description?: string[];
  isCurrentEmployer?: boolean;
}

export const EXPERIENCES: Experience[] = [
  {
    company: "WeFix by Fnac",
    description: [
      "Contribution à la refonte du site principal, améliorant l'UX et l'efficacité du parcours client.",
      "Conception et architecture d'APIs",
      "Amélioration UX/UI et création de prototypes",
      "Développement de nouvelles fonctionnalités web, répondant aux besoins de partenaires stratégiques.",
      "Conception d'un design system pour garantir cohérence et efficacité entre les équipes dev et design.",
      "Intégration et amélioration d'APIs",
      "Réflexion et création de landing pages",
      "Création site e-commerce et espace client optimisés pour la conversion et la rétention client.",
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
    title: "Lead Développeur Front-End",
    type: "CDI",
  },
  {
    company: "SpinalCom",
    description: [
      "Développement d'un tableau de bord de gestion des équipements connectés, améliorant leur surveillance.",
      "Optimisation de sites web existants.",
      "Création d'une carte interactive de données.",
      "Refonte de sites WordPress avec une intégration personnalisée pour une meilleure UX.",
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
    title: "Designer Web UX/UI",
    type: "Alternance",
  },
  {
    company: "Économat des Armées",
    description: [
      "Création d'un intranet sécurisé pour le ministère des Armées avec authentification SSO.",
      "Création d'un annuaire interne optimisé.",
      "Optimisation architecture front-end.",
      "Création d'un système de gestion de contenu modulaire permettant une mise à jour facile de contenus.",
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
    title: "Développeur Multi-plateformes",
    type: "Alternance",
  },
  {
    company: "ETNA (École des Technologies Numériques Avancées)",
    id: "etna-master",
    period: {
      end: "2020",
      start: "2016",
    },
    title: "Master développement web et mobile (Bac+5)",
  },
  {
    company:
      "Licence Scientifique - Université des Sciences UM2 Montpellier",
    id: "um2-licence",
    period: {
      end: "2016",
      start: "2013",
    },
    title: "Licence Scientifique (Bac+3), spécialité Biologie",
  },
  {
    company: " Lycée Jean Moulin (Pézenas)",
    id: "bac-s-jean-moulin",
    period: {
      end: "2013",
      start: "2010",
    },
    title: "Baccalauréat Scientifique (Bac), spécialité Biologie",
  },
];
