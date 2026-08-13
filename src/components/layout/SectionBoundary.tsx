"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface SectionBoundaryProps {
  children: ReactNode;
  /** rendu à la place de la section quand elle échoue (rien par défaut) */
  fallback?: ReactNode;
  /** crochet optionnel pour remonter l'erreur à un service de monitoring */
  onError?: (error: Error, componentStack?: string | null) => void;
}

interface SectionBoundaryState {
  hasError: boolean;
}

/**
 * Isole une section de page : si son rendu échoue, seule cette section
 * disparaît au lieu de faire tomber la page entière.
 *
 * `<Suspense>` ne remplit PAS ce rôle — il gère l'attente, pas les erreurs.
 */
export class SectionBoundary extends Component<
  SectionBoundaryProps,
  SectionBoundaryState
> {
  state: SectionBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "Section failed to render:",
      error,
      info.componentStack
    );
    this.props.onError?.(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
