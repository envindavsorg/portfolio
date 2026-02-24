import type { IconProps } from '@phosphor-icons/react';
import {
	GaugeIcon,
	PaletteIcon,
	SlidersIcon,
	TextTIcon,
	VaultIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { ComponentType } from 'react';

export const TOOLS_ICONS: Record<string, ComponentType<IconProps>> = {
	Base64: VaultIcon,
	Couleurs: PaletteIcon,
	Texte: TextTIcon,
	Internet: GaugeIcon,
	Json: SlidersIcon,
};
