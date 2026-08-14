const USER = {
  avatar: "/images/avatar.webp",
  bio: "crée, code, innove. les petits détails comptent.",
  description:
    "en tant que développeur front-end spécialisé dans l'écosystème moderne, je conçois des applications web performantes. j'utilise Next.js et React.js pour la structure, couplés à Tailwind CSS pour un design responsive et élégant. Mon workflow inclut Git pour le versioning et Node.js pour gérer l'environnement serveur, garantissant un code propre et optimisé pour le SEO.",
  emailAddress: "contact@cuzeacflorin.fr",
  firstName: "florin",
  fullName: "florin cuzeac",
  gender: "homme",
  lastName: "cuzeac",
  location: {
    city: "Paris, France",
  },
  og: "/images/og/og-image-dark.png?t=1755355653",
  phoneNumber: "+33 6 58 05 86 65",
  photo: "/images/photo.webp",
  pronouns: "il/lui",
  pronunciation: "/audio/florin.mp3",
  username: "envindavsorg",
  welcome: "bienvenue sur mon portfolio. bonne visite !",
} satisfies USER;

const OVERVIEW = {
  sentences: [
    "-- imagine, code, crée, inspire --",
    "-- chaque petit pixel compte --",
    "-- du concept au déploiement --",
    "-- chaque petit détail compte --",
  ],
} satisfies OVERVIEW;

const SOCIAL = {
  github: "https://github.com/envindavsorg/",
  linkedin: "https://fr.linkedin.com/in/cuzeacflorin/",
  portfolio: "https://cuzeacflorin.fr/",
} satisfies SOCIAL;

const WORK = {
  experience: "avec 7 ans d'expérience",
  jobs: [
    {
      company: "WeFix by Fnac",
      title: "Développeur Front-End Senior",
      website: "https://wefix.net/",
    },
    {
      company: "SpinalCom",
      title: "Développeur web & Designer UI/UX",
      website: "https://www.spinalcom.com/en/",
    },
    {
      company: "Économat des Armées",
      title: "Développeur Multi-plateformes",
      website: "https://www.economat-armees.com/",
    },
  ],
  title: "développeur Full-Stack Senior",
} satisfies WORK;

const CV = {
  name: "cv_florin_cuzeac.pdf",
  url: "https://cfhi75vpdo.ufs.sh/f/tIhJKzZYPGQBq3bQllCjGzmQByFvYMdbDwUilx4TH8AX3eZ5",
} satisfies CV;

const GLOBAL_DATA = {
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
  OVERVIEW,
  SOCIAL,
  USER,
  WORK,
};

export default GLOBAL_DATA;
