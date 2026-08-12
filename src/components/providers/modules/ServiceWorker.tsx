"use client";

import { useEffect } from "react";

import { logger } from "@/lib/logger";

/**
 * Enregistre le service worker, en production uniquement.
 *
 * Pas de rechargement forcé quand une nouvelle version prend la main : couper la
 * lecture d'un article pour appliquer une mise à jour est plus agressif que le
 * problème que ça résout. La version suivante s'appliquera à la prochaine
 * navigation, ce qui suffit pour un site de contenu.
 *
 * L'enregistrement attend le chargement complet : le faire pendant
 * l'hydratation met le fetch du script en concurrence avec celui des chunks de
 * la page, et retarde l'interactivité pour un bénéfice qui n'arrive qu'à la
 * visite suivante.
 */
const attemptRegistration = async () => {
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (error) {
    // un échec n'a aucune conséquence visible : le site fonctionne sans
    logger.warn("service worker non enregistré", error);
  }
};

export const ServiceWorker = () => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = () => {
      attemptRegistration();
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
};
