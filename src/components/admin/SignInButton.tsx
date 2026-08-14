"use client";

import { useState } from "react";

import { Button } from "@/components/primitives/Button";
import { signInWithGitHub } from "@/lib/admin/auth-client";

export const SignInButton = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = async () => {
    // la redirection quitte la page : l'état ne sert qu'à empêcher un second
    // clic pendant le trajet
    setIsRedirecting(true);
    await signInWithGitHub();
  };

  return (
    <Button
      disabled={isRedirecting}
      onClick={handleClick}
      variant="default"
    >
      {isRedirecting
        ? "redirection vers GitHub ..."
        : "se connecter avec GitHub"}
    </Button>
  );
};
