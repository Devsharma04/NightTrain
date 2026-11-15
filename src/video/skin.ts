import '../styles/video/scaffold.css';
import './skin.css';
import '@videojs/html/i18n';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-backdrop';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/controls-group';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/time-slider-chapters';
import '@videojs/html/ui/time-slider-chapter-title';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/playback-rate-button';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-item';
import '@videojs/html/ui/menu-checkbox-item';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/menu-item-indicator';
import '@videojs/html/ui/playback-rate-radio-group';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/status-announcer';
import { PlayerController, playerContext, selectFullscreen, selectPlayback, selectPlaybackRate, selectQuality, selectTextTrack, selectTime, selectVolume, UIElement } from '@videojs/html';
import { registerIcons } from '@videojs/html/icons';
import {
  captionsOffIcon,
  captionsOnIcon,
  fullscreenEnterIcon,
  fullscreenExitIcon,
  pauseIcon,
  playIcon,
  restartIcon,
  volumeHighIcon,
  volumeLowIcon,
  volumeOffIcon,
} from '@videojs/html/icons/scaffold';

registerIcons('scaffold', {
  'captions-off': captionsOffIcon,
  'captions-on': captionsOnIcon,
  'fullscreen-enter': fullscreenEnterIcon,
  'fullscreen-exit': fullscreenExitIcon,
  pause: pauseIcon,
  play: playIcon,
  restart: restartIcon,
  'volume-high': volumeHighIcon,
  'volume-low': volumeLowIcon,
  'volume-off': volumeOffIcon,
});

const stationPercentages = [14, 34, 55, 76, 91];
const speedNames = new Map<number, string>([
  [0.5, 'Slow freight'],
  [1, 'Local'],
  [1.5, 'Express'],
  [2, 'Rapid'],
]);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type RateGroupElement = HTMLElement & {
  formatRate?: (rate: number) => string;
  requestUpdate?: () => void;
};

type CheckboxMenuItem = HTMLElement & { checked: boolean };
type MenuElement = HTMLElement & { open: boolean; close: (reason?: string) => void };
type CueLike = { startTime: number; value?: unknown };

function normalizedBoardTime(value: string): string {
  const time = value.trim();
  const minuteSecond = /^(\d+):(\d{2})$/.exec(time);
  if (minuteSecond && minuteSecond[1].length < 2) return `${minuteSecond[1].padStart(2, '0')}:${minuteSecond[2]}`;
  return time || '00:00';
}

function formatClockTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function renderBoardDigits(board: HTMLElement): void {
  const source = board.querySelector<HTMLElement>('.tn-time-source');
  const output = board.querySelector<HTMLElement>('.tn-time-digits');
  if (!source || !output) return;

  const value = normalizedBoardTime(source.textContent ?? '');
  if (output.dataset.value === value) return;

  const fragment = document.createDocumentFragment();
  for (const character of value) {
    const digit = document.createElement('span');
    digit.className = character === ':' ? 'tn-time-colon' : 'tn-time-digit';
    digit.textContent = character;
    fragment.append(digit);
  }
  output.dataset.value = value;
  output.replaceChildren(fragment);
}

class NightTrainPlayerLogic extends UIElement {
  static readonly tagName = 'tn-player-logic';

  readonly #playback = new PlayerController(this, playerContext, selectPlayback);
  readonly #time = new PlayerController(this, playerContext, selectTime);
  readonly #volume = new PlayerController(this, playerContext, selectVolume);
  readonly #rate = new PlayerController(this, playerContext, selectPlaybackRate);
  readonly #quality = new PlayerController(this, playerContext, selectQuality);
  readonly #captions = new PlayerController(this, playerContext, selectTextTrack);
  readonly #fullscreen = new PlayerController(this, playerContext, selectFullscreen);

  #root: HTMLElement | null = null;
  #disconnect: AbortController | null = null;
  #shortcutsDialog: HTMLDialogElement | null = null;
  #shortcutsReturnTarget: HTMLElement | null = null;
  #wasSeeking = false;
  #seekOrigin: number | null = null;
  #lastTime: number | null = null;
  #lastTunnelTime = 0;
  #tunnelTimer: ReturnType<typeof setTimeout> | null = null;
  #signalTimer: ReturnType<typeof setTimeout> | null = null;
  #pointerStart: number | null = null;
  #pointerOverPlayer = false;
  #ticketTimer: ReturnType<typeof setTimeout> | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#root = this.closest<HTMLElement>('.night-train-skin');
    if (!this.#root) return;

    this.#disconnect = new AbortController();
    const { signal } = this.#disconnect;
    this.#root.addEventListener('keydown', this.#onKeyDown, { capture: true, signal });
    window.addEventListener('keydown', this.#onWindowKeyDown, { capture: true, signal });
    this.#root.addEventListener('click', this.#onClick, { capture: true, signal });
    this.#root.addEventListener('input', this.#onInput, { signal });
    this.#root.addEventListener('checked-change', this.#onCheckedChange, { signal });
    this.#root.addEventListener('select', this.#onMenuSelect, { signal });
    this.#root.addEventListener('open-change', this.#onMenuOpenChange, { signal });
    this.#root.addEventListener('pointerdown', this.#onPointerDown, { capture: true, signal });
    this.#root.addEventListener('pointerenter', this.#onPointerEnter, { signal });
    this.#root.addEventListener('pointerleave', this.#onPointerLeave, { signal });
    window.addEventListener('pointerup', this.#onPointerUp, { capture: true, signal });
    this.#root.addEventListener('pointercancel', this.#onPointerCancel, { capture: true, signal });
    this.#root.querySelector<HTMLElement>('.tn-time-slider')?.addEventListener('pointerenter', this.#onSliderPointerMove, { signal });
    this.#root.querySelector<HTMLElement>('.tn-time-slider')?.addEventListener('pointermove', this.#onSliderPointerMove, { signal });
    this.#root.querySelector<HTMLElement>('.tn-time-slider')?.addEventListener('pointerleave', this.#onSliderPointerLeave, { signal });
    this.#root.querySelector<HTMLElement>('.tn-time-slider')?.addEventListener('lostpointercapture', this.#onSliderPointerCancel, { signal });
    this.#root.querySelector<HTMLElement>('.tn-time-slider')?.addEventListener('focusout', this.#onSliderFocusOut, { signal });
    window.addEventListener('blur', this.#onWindowBlur, { signal });
    this.#root.addEventListener('cancel', this.#onDialogCancel, { signal });
    this.#root.addEventListener('click', this.#onDialogBackdropClick, { signal });
    this.#root.querySelector('media-error-dialog media-dialog-close')?.addEventListener('click', this.#onErrorDialogRetry, { signal });
    window.addEventListener('resize', this.#onResize, { signal });
    this.#shortcutsDialog = this.#root.querySelector<HTMLDialogElement>('.tn-shortcuts-dialog');

    this.#configureRateGroups();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
    if (this.#tunnelTimer) clearTimeout(this.#tunnelTimer);
    if (this.#signalTimer) clearTimeout(this.#signalTimer);
    if (this.#ticketTimer) clearTimeout(this.#ticketTimer);
  }

  protected override update(changed: Map<string, unknown>): void {
    super.update(changed);
    const root = this.#root;
    if (!root) return;

    root.querySelectorAll<HTMLElement>('.tn-time-board').forEach(renderBoardDigits);
    this.#configureRateGroups();

    const volume = this.#volume.value;
    if (volume) {
      const percent = Math.round(volume.volume * 100);
      const input = root.querySelector<HTMLInputElement>('.tn-volume-gauge-input');
      const needle = root.querySelector<HTMLElement>('.tn-gauge-needle');
      if (input && document.activeElement !== input && Number(input.value) !== percent) input.value = String(percent);
      input?.setAttribute('aria-valuetext', `${percent} percent`);
      input?.toggleAttribute('disabled', volume.volumeAvailability !== 'available');
      needle?.style.setProperty('--gauge-angle', `${-90 + percent * 1.8}deg`);

      const mute = root.querySelector<HTMLElement>('.tn-mute-button');
      if (mute) mute.setAttribute('aria-label', volume.muted ? 'Unmute' : 'Mute');
    }

    const time = this.#time.value;
    if (time) {
      this.#updateStationInfo(time.currentTime, time.duration);
      if (time.seeking && !this.#wasSeeking) this.#seekOrigin = this.#lastTime ?? time.currentTime;
      if (!time.seeking && this.#wasSeeking && this.#seekOrigin !== null) {
        this.#maybeTunnel(this.#seekOrigin, time.currentTime);
        this.#seekOrigin = null;
      }
      this.#wasSeeking = time.seeking;
      if (!time.seeking) this.#lastTime = time.currentTime;
    }

    const buffering = Boolean(this.#playback.value?.waiting || this.#playback.value?.autoplaying);
    this.#setBuffering(buffering);

    const captions = this.#captions.value;
    const captionsRow = root.querySelector<CheckboxMenuItem>('[data-sheet-captions]');
    if (captionsRow && captions) {
      captionsRow.checked = captions.subtitlesShowing;
      captionsRow.querySelector<HTMLElement>('.tn-sheet-status')!.textContent = captions.subtitlesShowing ? 'On' : 'Off';
      const available = captions.textTrackList.some((track) => track.kind === 'captions' || track.kind === 'subtitles');
      captionsRow.toggleAttribute('disabled', !available);
    }

    const rate = this.#rate.value?.playbackRate ?? 1;
    const speedHint = root.querySelector<HTMLElement>('[data-more-speed-hint]');
    if (speedHint) speedHint.textContent = `${speedNames.get(rate) ?? 'Local'} ${rate}x`;
    const quality = this.#quality.value;
    const qualityHint = root.querySelector<HTMLElement>('[data-more-quality-hint]');
    if (qualityHint) {
      const rendition = quality?.activeVideoRendition;
      qualityHint.textContent = rendition?.selected && rendition.height ? `${rendition.height}p` : 'Auto';
    }

    const fullscreen = this.#fullscreen.value;
    const fullscreenButton = root.querySelector<HTMLElement>('.tn-fullscreen-button');
    if (fullscreenButton && fullscreen) fullscreenButton.setAttribute('aria-label', fullscreen.isFullscreen ? 'Exit fullscreen' : 'Fullscreen');

    const playback = this.#playback.value;
    const previousState = root.dataset.demoState;
    const media = root.querySelector<HTMLMediaElement>('mux-video');
    if (previousState === 'playing' && playback?.paused && media?.paused !== false) root.dataset.demoState = 'paused';
  }

  #configureRateGroups(): void {
    if (!this.#root) return;
    for (const group of this.#root.querySelectorAll<RateGroupElement>('media-playback-rate-radio-group')) {
      if (group.dataset.nightTrainConfigured === 'true') continue;
      group.formatRate = (rate: number) => speedNames.get(rate) ?? `${rate}x`;
      group.dataset.nightTrainConfigured = 'true';
      group.requestUpdate?.();
    }

    for (const button of this.#root.querySelectorAll<HTMLElement>('.tn-speed-button')) {
      const rate = Number(button.getAttribute('data-rate'));
      const label = button.querySelector<HTMLElement>('.tn-speed-label');
      if (!label || !Number.isFinite(rate)) continue;
      label.textContent = `${speedNames.get(rate) ?? 'Local'} ${rate}x`;
    }
  }

  #onInput = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches('.tn-volume-gauge-input')) return;
    const percent = Number(target.value);
    target.setAttribute('aria-valuetext', `${percent} percent`);
    this.#volume.value?.setVolume(percent / 100);
  };

  #onClick = (event: MouseEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || !this.#root) return;

    const retryControl = event.composedPath().find((node): node is Element => node instanceof Element && node.matches('[data-error-retry]'));
    if (retryControl) {
      event.preventDefault();
      this.#retrySource();
    }

    const dialogClose = target.closest('.tn-dialog-close');
    if (dialogClose) this.#closeShortcuts();
  };

  #onErrorDialogRetry = (): void => this.#retrySource();

  #retrySource(): void {
    const root = this.#root;
    if (!root) return;
    if (root.dataset.demoState === 'error') root.dataset.demoState = 'paused';
    const media = root.querySelector<HTMLElement & { load?: () => void }>('mux-video');
    const source = media?.getAttribute('src');
    if (!media || !source) return;
    media.removeAttribute('src');
    window.setTimeout(() => {
      media.setAttribute('src', source);
      media.load?.();
    }, 60);
  }

  #onCheckedChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const checked = Boolean((event as CustomEvent<{ checked?: boolean }>).detail?.checked);
    if (target.matches('[data-sheet-captions]')) this.#captions.value?.toggleSubtitles(checked);
  };

  #onMenuSelect = (event: Event): void => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest('[data-close-more]')) {
      this.#root?.querySelector<MenuElement>('.tn-more-menu')?.close('close-button');
      this.#root?.querySelector<HTMLElement>('.tn-more-button')?.focus();
      return;
    }
    const seek = Number(target?.closest<HTMLElement>('[data-menu-seek]')?.dataset.menuSeek);
    if (!Number.isFinite(seek)) return;
    const time = this.#time.value;
    if (time) void time.seek(Math.max(0, Math.min(time.duration, time.currentTime + seek)));
  };

  #onPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('.tn-time-slider')) {
      this.#pointerStart = this.#time.value?.currentTime ?? null;
      this.#showTicket();
    }
  };

  #onPointerUp = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (this.#pointerStart !== null) {
      const origin = this.#pointerStart;
      this.#pointerStart = null;
      if (target?.closest('.tn-time-slider')) {
        window.setTimeout(() => {
          const time = this.#time.value;
          if (time && !time.seeking) this.#maybeTunnel(origin, time.currentTime);
        }, 120);
      }
    }
    if (event.pointerType === 'touch' || !this.#root?.querySelector<HTMLElement>('.tn-time-slider')?.matches(':hover')) this.#hideTicket();
  };

  #onPointerEnter = (): void => { this.#pointerOverPlayer = true; };

  #onPointerLeave = (): void => {
    this.#pointerOverPlayer = false;
    if (this.#pointerStart === null) this.#hideTicket();
  };

  #onSliderPointerMove = (): void => this.#showTicket();

  #onSliderPointerLeave = (): void => {
    if (this.#pointerStart === null) this.#hideTicket();
  };

  #onSliderPointerCancel = (): void => {
    this.#pointerStart = null;
    this.#hideTicket();
  };

  #onPointerCancel = (event: PointerEvent): void => {
    if (!(event.target instanceof Element) || !event.target.closest('.tn-time-slider')) return;
    this.#onSliderPointerCancel();
  };

  #onSliderFocusOut = (event: FocusEvent): void => {
    const slider = event.currentTarget as HTMLElement;
    if (!(event.relatedTarget instanceof Node) || !slider.contains(event.relatedTarget)) this.#hideTicket();
  };

  #onWindowBlur = (): void => {
    this.#pointerOverPlayer = false;
    this.#pointerStart = null;
    this.#hideTicket();
  };

  #showTicket = (hideAfter?: number): void => {
    const slider = this.#root?.querySelector<HTMLElement>('.tn-time-slider');
    if (!slider) return;
    slider.setAttribute('data-ticket-visible', '');
    slider.setAttribute('data-pointing', '');
    slider.querySelector<HTMLElement>('.tn-slider-preview')?.setAttribute('data-pointing', '');
    if (this.#ticketTimer) clearTimeout(this.#ticketTimer);
    if (hideAfter !== undefined) this.#ticketTimer = window.setTimeout(this.#hideTicket, hideAfter);
  };

  #hideTicket = (): void => {
    const slider = this.#root?.querySelector<HTMLElement>('.tn-time-slider');
    slider?.removeAttribute('data-ticket-visible');
    slider?.removeAttribute('data-pointing');
    slider?.querySelector<HTMLElement>('.tn-slider-preview')?.removeAttribute('data-pointing');
    if (this.#ticketTimer) clearTimeout(this.#ticketTimer);
    this.#ticketTimer = null;
  };

  #onDialogCancel = (event: Event): void => {
    if (event.target !== this.#shortcutsDialog) return;
    event.preventDefault();
    this.#closeShortcuts();
  };

  #onDialogBackdropClick = (event: MouseEvent): void => {
    if (event.target === this.#shortcutsDialog) this.#closeShortcuts();
  };

  #onMenuOpenChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches('.tn-more-menu')) return;
    const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
    if (open) requestAnimationFrame(this.#positionMoreMenu);
  };

  #onResize = (): void => {
    const menu = this.#root?.querySelector<MenuElement>('.tn-more-menu');
    if (menu?.open) this.#positionMoreMenu();
  };

  #positionMoreMenu = (): void => {
    if (!this.#root) return;
    const menu = this.#root.querySelector<HTMLElement>('.tn-more-menu');
    if (!menu) return;
    const rect = this.#root.getBoundingClientRect();
    const height = Math.min(380, Math.max(300, rect.height * 0.68));
    menu.style.setProperty('--tn-sheet-left', `${Math.max(0, rect.left)}px`);
    menu.style.setProperty('--tn-sheet-bottom', `${Math.max(0, window.innerHeight - rect.bottom)}px`);
    menu.style.setProperty('--tn-sheet-width', `${Math.min(rect.width, window.innerWidth)}px`);
    menu.style.setProperty('--tn-sheet-height', `${height}px`);
  };

  #setBuffering(buffering: boolean): void {
    const root = this.#root;
    const slider = root?.querySelector<HTMLElement>('.tn-time-slider');
    if (!root || !slider) return;
    const wasBuffering = slider.hasAttribute('data-buffering');
    if (buffering) {
      if (this.#signalTimer) clearTimeout(this.#signalTimer);
      root.removeAttribute('data-semaphore-fading');
      slider.setAttribute('data-buffering', '');
    } else if (wasBuffering) {
      slider.removeAttribute('data-buffering');
      root.setAttribute('data-semaphore-fading', '');
      if (this.#signalTimer) clearTimeout(this.#signalTimer);
      this.#signalTimer = window.setTimeout(() => root.removeAttribute('data-semaphore-fading'), 600);
    }
  }

  #onWindowKeyDown = (event: KeyboardEvent): void => {
    const root = this.#root;
    if (!root || event.composedPath().includes(root) || !this.#pointerOverPlayer) return;
    if (document.activeElement !== document.body && document.activeElement !== document.documentElement) return;
    this.#handleArrowSeek(event);
  };

  #handleArrowSeek(event: KeyboardEvent): boolean {
    const root = this.#root;
    if (!root || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return false;
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return false;

    const target = event.target instanceof Element ? event.target : null;
    const onVolumeGauge = target?.closest('.tn-volume-gauge');
    const openMenu = [...root.querySelectorAll<MenuElement>('media-menu')].some((menu) => menu.open || menu.hasAttribute('data-open'));
    if (onVolumeGauge || openMenu || this.#shortcutsDialog?.open || root.querySelector('media-dialog-popup[data-open]')) return false;

    event.preventDefault();
    event.stopPropagation();
    const media = root.querySelector<HTMLElement & { currentTime: number; duration: number }>('mux-video, video');
    const duration = media?.duration ?? this.#time.value?.duration ?? 0;
    if (media && Number.isFinite(duration) && duration > 0) {
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      media.currentTime = Math.max(0, Math.min(duration, media.currentTime + direction * 5));
    }
    this.#showTicket(1200);
    return true;
  }

  #onKeyDown = (event: KeyboardEvent): void => {
    const root = this.#root;
    if (!root || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (this.#handleArrowSeek(event) || event.defaultPrevented) return;
    const key = event.key.toLowerCase();
    const shortcutDialogOpen = Boolean(this.#shortcutsDialog?.open);
    const openMenu = [...root.querySelectorAll<MenuElement>('media-menu')].find((menu) => menu.open || menu.hasAttribute('data-open'));

    if (key === 'escape') {
      if (shortcutDialogOpen) {
        event.preventDefault();
        this.#closeShortcuts();
        return;
      }
      if (openMenu) {
        event.preventDefault();
        event.stopPropagation();
        openMenu.close('escape');
        root.querySelector<HTMLElement>(`[commandfor="${openMenu.id}"]`)?.focus();
      }
      return;
    }

    if (shortcutDialogOpen || openMenu || key === 'tab') return;
    if (key === '?') {
      event.preventDefault();
      this.#openShortcuts();
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    const focusedButton = target?.closest('button, [role="button"], media-play-button, media-mute-button, media-seek-button, media-fullscreen-button, media-captions-button, media-playback-rate-button');
    if ((event.key === ' ' || key === 'enter') && focusedButton) return;

    if (event.key === ' ' || key === 'k') {
      event.preventDefault();
      this.#togglePlayback();
      return;
    }
    if (key === 'j' || key === 'l') {
      event.preventDefault();
      const time = this.#time.value;
      if (time) void time.seek(Math.max(0, Math.min(time.duration, time.currentTime + (key === 'j' ? -10 : 10))));
      return;
    }
    if (key === 'arrowleft' || key === 'arrowright') {
      if (target?.closest('.tn-volume-gauge')) this.#adjustVolume(key === 'arrowleft' ? -5 : 5);
      return;
    }
    if (key === 'pageup' || key === 'pagedown') {
      event.preventDefault();
      this.#seekStation(key === 'pageup' ? -1 : 1);
      return;
    }
    if (key === 'home' || key === 'end') {
      event.preventDefault();
      const time = this.#time.value;
      if (time) this.#performSeek(key === 'home' ? 0 : time.duration, true);
      return;
    }
    if (key === 'arrowup' || key === 'arrowdown') {
      event.preventDefault();
      this.#adjustVolume(key === 'arrowup' ? 5 : -5);
      return;
    }
    if (key === 'm') {
      event.preventDefault();
      const volume = this.#volume.value;
      if (volume) volume.setMuted(!volume.muted);
      return;
    }
    if (key === 'c') {
      event.preventDefault();
      this.#captions.value?.toggleSubtitles();
      return;
    }
    if (key === 'f') {
      event.preventDefault();
      const fullscreen = this.#fullscreen.value;
      if (fullscreen) void (fullscreen.isFullscreen ? fullscreen.exitFullscreen() : fullscreen.requestFullscreen());
      return;
    }
  };

  #togglePlayback(): void {
    const playback = this.#playback.value;
    if (!playback) return;
    if (playback.paused || playback.ended) {
      void playback.play();
    } else playback.pause();
  }

  #adjustVolume(delta: number): void {
    const volume = this.#volume.value;
    if (!volume || volume.volumeAvailability !== 'available') return;
    volume.setVolume(Math.max(0, Math.min(1, volume.volume + delta / 100)));
  }

  #seekStation(direction: -1 | 1): void {
    const time = this.#time.value;
    if (!time) return;
    const cues = ((this.#captions.value?.chaptersCues ?? []) as CueLike[]).sort((a, b) => a.startTime - b.startTime);
    const fallback = stationPercentages.map((position) => (position / 100) * time.duration);
    // The depot is the first stop in the route, so Page Up from the first
    // chapter station has a real destination instead of doing nothing.
    const stationTimes = [0, ...(cues.length ? cues.map((cue) => cue.startTime) : fallback)];
    const epsilon = 0.2;
    const target = direction < 0
      ? [...stationTimes].reverse().find((stationTime) => stationTime < time.currentTime - epsilon)
      : stationTimes.find((stationTime) => stationTime > time.currentTime + epsilon);
    if (target !== undefined) this.#performSeek(target, true);
  }

  #performSeek(target: number, tunnel: boolean): void {
    const time = this.#time.value;
    if (!time || !Number.isFinite(target) || time.duration <= 0) return;
    const destination = Math.max(0, Math.min(time.duration, target));
    if (tunnel) this.#maybeTunnel(time.currentTime, destination);
    void time.seek(destination);
  }

  #maybeTunnel(from: number, to: number): void {
    const time = this.#time.value;
    const slider = this.#root?.querySelector<HTMLElement>('.tn-time-slider');
    if (!time || !slider || time.duration <= 0 || Math.abs(to - from) <= time.duration * 0.08) return;
    if (Date.now() - this.#lastTunnelTime < 500) return;
    this.#lastTunnelTime = Date.now();
    if (reducedMotion()) return;

    const width = slider.getBoundingClientRect().width;
    const front = (value: number) => 18 + Math.max(0, Math.min(1, value / time.duration)) * Math.max(0, width - 18);
    const fromPx = front(from);
    const toPx = front(to);
    slider.style.setProperty('--tunnel-from', `${fromPx}px`);
    slider.style.setProperty('--tunnel-to', `${toPx}px`);
    slider.style.setProperty('--tunnel-left', `${Math.min(fromPx, toPx)}px`);
    slider.style.setProperty('--tunnel-width', `${Math.max(40, Math.abs(toPx - fromPx))}px`);
    slider.dataset.tunnelActive = '';
    if (this.#tunnelTimer) clearTimeout(this.#tunnelTimer);
    this.#tunnelTimer = window.setTimeout(() => slider.removeAttribute('data-tunnel-active'), 850);
  }

  #updateStationInfo(currentTime: number, duration: number): void {
    if (!this.#root) return;
    this.#syncTrainPosition(currentTime, duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const cues = (this.#captions.value?.chaptersCues ?? []) as CueLike[];
    const stations = [...this.#root.querySelectorAll<HTMLElement>('.tn-station')];
    const progress = currentTime / duration;
    stations.forEach((station) => station.toggleAttribute('data-passed', Number(station.dataset.position) / 100 <= progress));

    const orderedCues = [...cues].sort((a, b) => a.startTime - b.startTime);
    const currentCue = orderedCues.filter((cue) => cue.startTime <= currentTime + 0.05).at(-1);
    const currentSign = this.#root.querySelector<HTMLElement>('[data-current-station]');
    if (currentSign) {
      if (!currentCue) currentSign.textContent = 'Leaving the depot';
      else {
        const cueIndex = cues.indexOf(currentCue);
        const cueName = typeof currentCue.value === 'string' ? currentCue.value : stations[cueIndex]?.dataset.name ?? 'Station';
        currentSign.textContent = `Station ${cueIndex + 1} · ${cueName}`;
      }
    }

    const nextCue = cues.find((cue) => cue.startTime > currentTime + 0.05);
    let nextStation: HTMLElement | undefined;
    let nextTime = Number.POSITIVE_INFINITY;
    let stationIndex = -1;
    if (nextCue) {
      stationIndex = cues.indexOf(nextCue);
      nextTime = nextCue.startTime;
      nextStation = stations[stationIndex];
    } else {
      nextStation = stations.find((station) => Number(station.dataset.position) / 100 > progress);
      if (nextStation) {
        stationIndex = stations.indexOf(nextStation);
        nextTime = (Number(nextStation.dataset.position) / 100) * duration;
      }
    }

    const clock = this.#root.querySelector<HTMLElement>('.tn-station-clock');
    const cueName = typeof nextCue?.value === 'string' ? nextCue.value : undefined;
    const nextName = nextStation?.dataset.name ?? cueName ?? 'Next station';
    const remaining = Number.isFinite(nextTime) ? formatClockTime(Math.max(0, nextTime - currentTime)) : 'Last stop';
    const desktop = this.#root.querySelector<HTMLElement>('.tn-next-value');
    if (desktop) desktop.textContent = nextStation ? `${nextName} · ${remaining}` : 'Last stop';
    const mobile = this.#root.querySelector<HTMLElement>('.tn-mobile-next');
    if (mobile) mobile.textContent = nextStation ? `Next · ${nextName} ${remaining}` : 'Next · Last stop';

    if (!clock || !nextStation || !Number.isFinite(nextTime)) clock?.removeAttribute('data-visible');
    else {
      clock.dataset.visible = '';
      const cueTime = nextCue?.startTime ?? nextTime;
      const minutes = Math.floor(cueTime / 60);
      const seconds = cueTime % 60;
      clock.style.setProperty('--clock-hour-angle', `${minutes * 30}deg`);
      clock.style.setProperty('--clock-minute-angle', `${seconds * 6}deg`);
    }

  }

  #syncTrainPosition(currentTime: number, duration: number): void {
    const slider = this.#root?.querySelector<HTMLElement>('.tn-time-slider');
    if (!this.#root || !slider) return;
    const width = slider.getBoundingClientRect().width;
    const progress = Number.isFinite(duration) && duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
    const front = width > 18 ? 18 + progress * (width - 18) : 18;
    slider.style.setProperty('--tn-playhead-front', `${front}px`);
  }

  #openShortcuts(): void {
    if (!this.#shortcutsDialog) return;
    this.#shortcutsReturnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      if (!this.#shortcutsDialog.open) this.#shortcutsDialog.showModal();
    } catch {
      this.#shortcutsDialog.setAttribute('open', '');
    }
    this.#shortcutsDialog.querySelector<HTMLElement>('.tn-dialog-close')?.focus();
  }

  #closeShortcuts(): void {
    if (this.#shortcutsDialog?.open) this.#shortcutsDialog.close();
    if (this.#shortcutsDialog?.hasAttribute('open')) this.#shortcutsDialog.removeAttribute('open');
    this.#shortcutsReturnTarget?.focus();
    this.#shortcutsReturnTarget = null;
  }
}

class NightTrainStateDemo extends UIElement {
  static readonly tagName = 'tn-player-state-demo';

  readonly #playback = new PlayerController(this, playerContext, selectPlayback);
  readonly #time = new PlayerController(this, playerContext, selectTime);
  #disconnect: AbortController | null = null;
  #root: HTMLElement | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#disconnect = new AbortController();
    this.addEventListener('click', this.#onClick, { signal: this.#disconnect.signal });
    this.#root = this.closest('video-player')?.querySelector<HTMLElement>('.night-train-skin') ?? null;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }

  protected override update(changed: Map<string, unknown>): void {
    super.update(changed);
    const active = this.#root?.dataset.demoState;
    this.querySelectorAll<HTMLButtonElement>('[data-player-state]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.playerState === active));
    });
  }

  #onClick = (event: MouseEvent): void => {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-player-state]') : null;
    const state = target?.dataset.playerState;
    const root = this.#root;
    const playback = this.#playback.value;
    const time = this.#time.value;
    if (!root || !state || !playback) return;
    const media = root.querySelector<HTMLMediaElement>('mux-video');
    root.dataset.demoState = state;
    const restart = state !== 'ended' && playback.ended && time && time.duration > 0;
    const markResumed = (): void => {
      if (root.dataset.demoState === 'paused' && media && !media.paused) {
        root.dataset.demoState = 'playing';
        this.requestUpdate();
      }
    };
    if (restart && state === 'playing') media?.addEventListener('playing', markResumed, { once: true });
    const restartPromise = restart ? time.seek(0) : null;
    switch (state) {
      case 'playing':
        if (restartPromise) {
          void restartPromise.then(() => playback.play()).then(() => {
            markResumed();
            window.setTimeout(markResumed, 150);
            window.setTimeout(markResumed, 500);
          });
        }
        else void playback.play();
        break;
      case 'paused':
        playback.pause();
        break;
      case 'buffering':
        playback.pause();
        break;
      case 'ended':
        playback.pause();
        if (time && time.duration > 0) void time.seek(time.duration);
        break;
      case 'error':
        playback.pause();
        break;
    }
    this.requestUpdate();
  };
}

if (!customElements.get(NightTrainPlayerLogic.tagName)) customElements.define(NightTrainPlayerLogic.tagName, NightTrainPlayerLogic);
if (!customElements.get(NightTrainStateDemo.tagName)) customElements.define(NightTrainStateDemo.tagName, NightTrainStateDemo);
