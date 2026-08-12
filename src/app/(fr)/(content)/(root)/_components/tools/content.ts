import type { IconProps } from "@phosphor-icons/react";
import {
  AsteriskIcon,
  CircleHalfTiltIcon,
  ClockIcon,
  FingerprintIcon,
  GaugeIcon,
  GitDiffIcon,
  KeyIcon,
  PaletteIcon,
  SlidersIcon,
  TextAaIcon,
  TextTIcon,
  TimerIcon,
  VaultIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";

/**
 * Icône d'un outil, choisie d'après son premier tag reconnu.
 *
 * Un outil dont aucun tag n'apparaît ici s'affiche sans icône : ce n'est pas une
 * erreur bloquante, mais la liste de la page d'accueil devient irrégulière. Tout
 * nouvel outil doit donc déclarer son tag principal ici.
 */
export const TOOLS_ICONS: Record<string, ComponentType<IconProps>> = {
  base64: VaultIcon,
  casse: TextAaIcon,
  contraste: CircleHalfTiltIcon,
  couleurs: PaletteIcon,
  cron: TimerIcon,
  crypto: FingerprintIcon,
  dates: ClockIcon,
  design: CircleHalfTiltIcon,
  diff: GitDiffIcon,
  hash: FingerprintIcon,
  internet: GaugeIcon,
  json: SlidersIcon,
  jwt: KeyIcon,
  regex: AsteriskIcon,
  texte: TextTIcon,
};
