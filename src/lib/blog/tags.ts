import {
	GaugeIcon,
	type IconProps,
	PaletteIcon,
	TableIcon,
	TextTIcon,
	VaultIcon,
} from '@phosphor-icons/react';
import type React from 'react';

const UTILS_TAG_ICONS = {
	Base64: VaultIcon,
	Couleurs: PaletteIcon,
	Texte: TextTIcon,
	Internet: GaugeIcon,
	Json: TableIcon,
} as const;

export const getIconForUtilsTags = (
	tags?: string[],
): React.ForwardRefExoticComponent<IconProps> | null => {
	const tag = tags?.find((t: string) => t in UTILS_TAG_ICONS);
	return tag ? UTILS_TAG_ICONS[tag as keyof typeof UTILS_TAG_ICONS] : null;
};
