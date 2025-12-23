import type { MetadataRoute } from 'next';
import { USER } from '@/lib/user';

const manifest = (): MetadataRoute.Manifest => ({
	short_name: USER.firstName,
	name: USER.firstName,
	description: USER.bio,
	icons: [
		{
			src: '/icon-192x192.png',
			type: 'image/png',
			sizes: '192x192',
			purpose: 'any',
		},
		{
			src: '/icon-512x512.png',
			type: 'image/png',
			sizes: '512x512',
			purpose: 'any',
		},
		{
			src: '/maskable-icon.png',
			type: 'image/png',
			sizes: '512x512',
			purpose: 'maskable',
		},
	],
	display: 'standalone',
	scope: '/',
	screenshots: [
		{
			src: '/meta/mobile-dark.webp',
			type: 'image/webp',
			sizes: '440x956',
			form_factor: 'narrow',
		},
		{
			src: '/meta/mobile-light.webp',
			type: 'image/webp',
			sizes: '440x956',
			form_factor: 'narrow',
		},
		{
			src: '/meta/desktop-dark.webp',
			type: 'image/webp',
			sizes: '1920x1080',
			form_factor: 'wide',
		},
		{
			src: '/meta/desktop-light.webp',
			type: 'image/webp',
			sizes: '1920x1080',
			form_factor: 'wide',
		},
	],
});

export default manifest;
