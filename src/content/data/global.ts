const USER = {
  firstName: "Florin",
  lastName: "Cuzeac",
  fullName: "Florin Cuzeac",
  username: "envindavsorg",
  gender: "homme",
  pronouns: "il/lui",
  bio: "Crée, code, innove. Les petits détails comptent.",
  description:
    "En tant que développeur front-end spécialisé dans l'écosystème moderne, je conçois des applications web performantes. J'utilise Next.js et React.js pour la structure, couplés à Tailwind CSS pour un design responsive et élégant. Mon workflow inclut Git pour le versioning et Node.js pour gérer l'environnement serveur, garantissant un code propre et optimisé pour le SEO.",
  phoneNumber: "06 58 05 86 65",
  emailAddress: "contact@cuzeacflorin.fr",
  location: {
    city: "Paris, France",
  },
  photo: "/images/photo.webp",
  avatar: "/images/avatar.webp",
  og: "/images/og-image-dark.png?t=1755355653",
  pronunciation: "/audio/florin.mp3",
  welcome: "Bienvenue sur mon portfolio. Bonne visite !",
} satisfies USER;

const OVERVIEW = {
  sentences: [
    "Imagine, code, crée, inspire.",
    "Chaque petit pixel compte !",
    "Du concept au déploiement !",
    "Chaque petit détail compte !",
  ],
} satisfies OVERVIEW;

const SOCIAL = {
  github: "https://github.com/envindavsorg/",
  linkedin: "https://fr.linkedin.com/in/cuzeacflorin/",
  portfolio: "https://cuzeacflorin.fr/",
} satisfies SOCIAL;

const WORK = {
  title: "Développeur Full-Stack",
  experience: "7 ans d'expérience",
  jobs: [
    {
      title: "Développeur Front-End Senior",
      company: "WeFix by Fnac",
      website: "https://wefix.net/",
    },
    {
      title: "Développeur web & Designer UI/UX",
      company: "SpinalCom",
      website: "https://www.spinalcom.com/en/",
    },
    {
      title: "Développeur Multi-plateformes",
      company: "Économat des Armées",
      website: "https://www.economat-armees.com/",
    },
  ],
} satisfies WORK;

const CV = {
  url: "https://cfhi75vpdo.ufs.sh/f/tIhJKzZYPGQBq3bQllCjGzmQByFvYMdbDwUilx4TH8AX3eZ5",
  name: "cv_florin_cuzeac.pdf",
} satisfies CV;

const GLOBAL_DATA = {
  USER,
  OVERVIEW,
  SOCIAL,
  WORK,
  CV,

  // keywords for better SEO
  keywords: [
    "web developer",
    "web designer",
    "front-end developer",
    "front-end designer",
    "front-end engineer",
    "ui developer",
    "fullstack javascript developer",
    "creative developer",
    "freelance web",
    // languages
    "html",
    "html5",
    "css",
    "css3",
    "javascript",
    "es6+",
    "typescript",
    "markdown",
    // react ecosystem
    "react",
    "react.js",
    "react hooks",
    "nextjs",
    "next.js",
    "app router",
    "server components",
    "ssr",
    "ssg",
    "jsx",
    "context api",
    "redux",
    "zustand",
    "tanstack query",
    // styling
    "tailwindcss",
    "responsive design",
    "mobile-first",
    "css modules",
    "sass",
    "scss",
    "styled-components",
    "flexbox",
    "css grid",
    "dark mode",
    "framer motion",
    "shadcn/ui",
    // backend
    "nodejs",
    "api rest",
    "graphql",
    "postgresql",
    "prisma",
    "supabase",
    "firebase",
    "authentication",
    "nextauth.js",
    // utils
    "pnpm",
    "npm",
    "yarn",
    "git",
    "github",
    "gitlab",
    "vite",
    "webpack",
    "eslint",
    "prettier",
    // seo
    "seo",
    "technical seo",
    "core web vitals",
    "lighthouse",
    "performance optimization",
    "accessibility",
    "a11y",
    // design
    "figma",
    "ui/ux design",
    "prototyping",
    "wireframing",
    "pixel perfect",
  ],
};

export default GLOBAL_DATA;
