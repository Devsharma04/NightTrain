import '@videojs/html/video/player';
import '@videojs/html/media/mux-video';
import '@/video/skin';
import skinTemplate from '@/video/skin.html?raw';

const PLAYBACK_ID = '901ktkv02FRKc5f3CWqZUR2mex86YjavAcrJLjT01mDGbM';
const SRC = `https://stream.mux.com/${PLAYBACK_ID}.m3u8`;
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.webp?time=69`;
const CHAPTERS = './train-route-chapters.vtt';
const CAPTIONS = './night-train-captions.vtt';
const MEDIA_PLACEHOLDER = '<!-- Add a compatible media component here. -->';
let playerInstance = 0;

export type NightTrainPlayerOptions = {
  autoplay?: boolean;
  stateControls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
};

export function createNightTrainContainer(options: Pick<NightTrainPlayerOptions, 'autoplay' | 'preload'> = {}): HTMLElement {
  const autoplay = Boolean(options.autoplay);
  const preload = options.preload ?? (autoplay ? 'auto' : 'metadata');
  const media = `<mux-video src="${SRC}" playsinline crossorigin="anonymous" preload="${preload}"${autoplay ? ' autoplay muted' : ''}><track kind="chapters" label="English" srclang="en" src="${CHAPTERS}" default><track kind="captions" label="English demo" srclang="en" src="${CAPTIONS}"></mux-video>`;
  const template = document.createElement('template');
  template.innerHTML = skinTemplate.replace(MEDIA_PLACEHOLDER, media);
  const container = template.content.firstElementChild;
  if (!(container instanceof HTMLElement)) throw new Error('Night Train skin template did not render a media container.');

  const ids = new Map<string, string>();
  const instanceId = ++playerInstance;
  container.querySelectorAll<HTMLElement>('[id]').forEach((element) => {
    const oldId = element.id;
    const newId = `${oldId}-${instanceId}`;
    ids.set(oldId, newId);
    element.id = newId;
  });
  container.querySelectorAll<HTMLElement>('[commandfor], [aria-labelledby], [aria-describedby], [aria-controls], [for], [list], [form]').forEach((element) => {
    for (const attribute of ['commandfor', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'for', 'list', 'form']) {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, value.split(/\s+/).map((id) => ids.get(id) ?? id).join(' '));
    }
  });

  return container;
}

export function createNightTrainPlayer(options: NightTrainPlayerOptions = {}): HTMLElement {
  const player = document.createElement('video-player');
  player.className = 'night-train-provider';
  player.setAttribute('poster', POSTER);
  player.setAttribute('default-playback-rates', '0.5 1 1.5 2');
  player.append(createNightTrainContainer(options));

  if (options.stateControls) {
    const states = document.createElement('tn-player-state-demo');
    states.className = 'tn-player-state-demo';
    states.innerHTML = `
      <div class="site-state-buttons" role="group" aria-label="Player states">
        <button type="button" data-player-state="playing" aria-pressed="false">Playing</button>
        <button type="button" data-player-state="paused" aria-pressed="false">Paused</button>
        <button type="button" data-player-state="buffering" aria-pressed="false">Buffering</button>
        <button type="button" data-player-state="ended" aria-pressed="false">Ended</button>
        <button type="button" data-player-state="error" aria-pressed="false">Error</button>
      </div>`;
    player.append(states);
  }

  return player;
}
