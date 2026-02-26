import type { IconProps } from '@phosphor-icons/react';
import {
	CircleHalfTiltIcon,
	GaugeIcon,
	PaletteIcon,
	SlidersIcon,
	TextTIcon,
	VaultIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { ComponentType } from 'react';

export const TOOLS_ICONS: Record<string, ComponentType<IconProps>> = {
	base64: VaultIcon,
	couleurs: PaletteIcon,
	texte: TextTIcon,
	internet: GaugeIcon,
	json: SlidersIcon,
	design: CircleHalfTiltIcon,
};
