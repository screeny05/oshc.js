export class FxEntity {
  constructor(private readonly ref: HTMLAudioElement) {}

  play(): void {
    this.ref.play();
  }

  pause(): void {
    this.ref.pause();
  }

  stop(): void {
    this.pause();
    this.ref.currentTime = 0;
  }

  loop(doLoop: boolean = true): void {
    this.ref.loop = doLoop;
  }

  fadeOut(timeMs: number = 1000): void {
    const targetTime = Date.now() + timeMs;
    const intervalTime = 20;
    const intervalCount = timeMs / intervalTime;
    const decrement = this.ref.volume / intervalCount;

    const interval = setInterval(() => {
      if (Date.now() > targetTime) {
        clearInterval(interval);
        this.stop();
      }

      this.ref.volume -= decrement;
    }, intervalTime);
  }
}

class FxPlayer {
  fxCache: Map<string, FxEntity> = new Map();

  // TODO volume.txt
  load(sound: string): FxEntity {
    if (this.fxCache.has(sound)) {
      return this.fxCache.get(sound)!;
    }
    const audio = new Audio(`/orgx/fx/${sound}.ogg`);
    const fx = new FxEntity(audio);
    audio.load();
    this.fxCache.set(sound, fx);
    return fx;
  }

  play(sound: string, { loop }: { loop?: boolean } = {}): FxEntity {
    const audio = this.load(sound);
    if (loop) {
      audio.loop();
    }
    audio.play();
    return audio;
  }
}

export default new FxPlayer();
