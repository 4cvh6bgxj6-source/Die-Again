
import { Howl, Howler } from 'howler';

const LOBBY_MUSIC_URL = 'https://cdn.pixabay.com/audio/2021/11/24/audio_83036d7987.mp3';
const GAME_MUSIC_URL = 'https://cdn.pixabay.com/audio/2021/11/23/audio_0c98f5a54c.mp3';
const DEATH_SFX_URL = 'https://cdn.pixabay.com/audio/2023/12/31/audio_403c621815.mp3'; // Dramatic impact
const JUMP_SFX_URL = 'https://cdn.pixabay.com/audio/2021/08/04/audio_96489437b4.mp3'; // Classic jump
const WIN_SFX_URL = 'https://cdn.pixabay.com/audio/2021/08/04/audio_1079366e6c.mp3'; // Victory fanfarre

class AudioService {
  private lobbyMusic: Howl;
  private gameMusic: Howl;
  private deathSfx: Howl;
  private jumpSfx: Howl;
  private winSfx: Howl;
  private currentMusic: Howl | null = null;
  private isMuted: boolean = false;
  private hasInteracted: boolean = false;

  constructor() {
    this.lobbyMusic = new Howl({
      src: [LOBBY_MUSIC_URL],
      loop: true,
      volume: 0.3,
      html5: false // Try Web Audio for better control in some environments
    });

    this.gameMusic = new Howl({
      src: [GAME_MUSIC_URL],
      loop: true,
      volume: 0.4,
      html5: false
    });

    this.deathSfx = new Howl({ src: [DEATH_SFX_URL], volume: 0.8 });
    this.jumpSfx = new Howl({ src: [JUMP_SFX_URL], volume: 0.4 });
    this.winSfx = new Howl({ src: [WIN_SFX_URL], volume: 0.7 });

    // Handle standard browser restriction: audio only plays after interaction
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.resume();
        window.removeEventListener('mousedown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('mousedown', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  resume() {
    if (this.hasInteracted) return;
    this.hasInteracted = true;
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume().then(() => {
        if (this.currentMusic && !this.currentMusic.playing()) {
          this.currentMusic.play();
        }
      });
    } else {
      if (this.currentMusic && !this.currentMusic.playing()) {
        this.currentMusic.play();
      }
    }
  }

  playLobbyMusic() {
    this.switchMusic(this.lobbyMusic);
  }

  playGameMusic() {
    this.switchMusic(this.gameMusic);
  }

  playDeath() {
    this.deathSfx.play();
  }

  playJump() {
    this.jumpSfx.play();
  }

  playWin() {
    this.winSfx.play();
  }

  private switchMusic(nextMusic: Howl) {
    if (this.currentMusic === nextMusic) return;

    if (this.currentMusic) {
      this.currentMusic.fade(this.currentMusic.volume(), 0, 800);
      const prev = this.currentMusic;
      setTimeout(() => prev.stop(), 800);
    }

    this.currentMusic = nextMusic;
    
    // Attempt play - Howler will queue it if not yet interacted
    this.currentMusic.play();
    this.currentMusic.fade(0, nextMusic.volume(), 800);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    return this.isMuted;
  }
}

export const audioService = new AudioService();
