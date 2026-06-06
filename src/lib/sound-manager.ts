import { logger } from "@/lib/logger";

const waitForEnded = (audio: HTMLAudioElement): Promise<void> =>
  // oxlint-disable-next-line avoid-new -- bridging the DOM `ended` event into a promise requires the Promise constructor
  new Promise<void>((resolve) => {
    const handleEnded = () => {
      audio.removeEventListener("ended", handleEnded);
      resolve();
    };
    audio.addEventListener("ended", handleEnded);
  });

class SoundManager {
  private readonly audioCache = new Map<string, HTMLAudioElement>();
  private readonly isClient = typeof window !== "undefined";

  private readonly getAudio = (url: string): HTMLAudioElement => {
    const cached = this.audioCache.get(url);
    if (cached) {
      return cached;
    }

    const audio = new Audio(url);
    audio.preload = "auto";
    this.audioCache.set(url, audio);
    return audio;
  };

  playAudio = async (url: string): Promise<void> => {
    if (!this.isClient) {
      return;
    }

    const audio = this.getAudio(url);
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch (error) {
      logger.warn(`Audio play failed for ${url}:`, error);
      return;
    }
    await waitForEnded(audio);
  };

  playThemeSound = () => this.playAudio("/audio/click.wav");

  playToastSound = () => this.playAudio("/audio/notification.wav");

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
      audio.src = "";
    }
    this.audioCache.clear();
  };
}

export const soundManager = new SoundManager();
