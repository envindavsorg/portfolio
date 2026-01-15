import { logger } from '@/lib/logger';

class SoundManager {
	private readonly audioCache = new Map<string, HTMLAudioElement>();
	private readonly isClient = typeof window !== 'undefined';

	private readonly getAudio = (url: string): HTMLAudioElement => {
		let audio = this.audioCache.get(url);

		if (!audio) {
			audio = new Audio(url);
			audio.preload = 'auto';
			this.audioCache.set(url, audio);
		}

		return audio;
	};

	playAudio = (url: string): Promise<void> => {
		return new Promise((resolve) => {
			if (!this.isClient) {
				resolve();
				return;
			}

			const audio = this.getAudio(url);
			audio.currentTime = 0;

			const handleEnded = () => {
				audio.removeEventListener('ended', handleEnded);
				resolve();
			};

			audio.addEventListener('ended', handleEnded);

			audio.play().catch((error) => {
				audio.removeEventListener('ended', handleEnded);
				logger.warn(`Audio play failed for ${url}:`, error);
				resolve();
			});
		});
	};

	playThemeSound = async () => await this.playAudio('/audio/click.wav');

	playToastSound = async () => await this.playAudio('/audio/notification.wav');

	preload = (urls: string[]) => {
		if (!this.isClient) {
			return;
		}

		for (const url of urls) {
			this.getAudio(url);
		}
	};

	dispose = () => {
		for (const audio of this.audioCache.values()) {
			audio.pause();
			audio.src = '';
		}

		this.audioCache.clear();
	};
}

export const soundManager = new SoundManager();
