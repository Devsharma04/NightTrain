import './site.css';
import { createNightTrainPlayer } from '@/video/player';

const root = document.querySelector<HTMLElement>('#site-root');
if (!root) throw new Error('Night Train website root was not found.');

const howCards = [
  ['01', 'Seek bar', 'Railway track', '↔'],
  ['02', 'Playhead', 'Three-piece train', '▰'],
  ['03', 'Chapters', 'Station signs', '⚑'],
  ['04', 'Time', 'Split-flap boards', '▦'],
  ['05', 'Volume', 'Pressure gauge', '◉'],
  ['06', 'Buffering', 'Semaphore', '⌁'],
  ['07', 'Big skip', 'Tunnel', '⌒'],
  ['08', 'Playback speed', 'Service clock', '◷'],
];

root.innerHTML = `
  <a class="site-skip" href="#main-content">Skip to content</a>
  <div class="site-sky" aria-hidden="true">
    <span class="site-moon"></span>
    <span class="site-star site-star--1"></span><span class="site-star site-star--2"></span><span class="site-star site-star--3"></span>
    <span class="site-star site-star--4"></span><span class="site-star site-star--5"></span><span class="site-star site-star--6"></span>
    <span class="site-star site-star--7"></span><span class="site-star site-star--8"></span><span class="site-star site-star--9"></span>
    <span class="site-star site-star--10"></span><span class="site-star site-star--11"></span><span class="site-star site-star--12"></span>
    <span class="site-skyline site-skyline--far"></span><span class="site-skyline site-skyline--near"></span>
  </div>
  <div class="site-shell">
    <header class="site-header">
      <a class="site-wordmark" href="#top"><span class="site-mark" aria-hidden="true">✳</span> Night Train</a>
      <div class="site-header-center">
        <div class="site-clock" aria-label="Local time"><span class="site-clock-label">Local time</span><time id="site-clock">00:00:00</time></div>
        <p class="site-try-it"><b>Try it</b><span>Drag the train. Skip ahead for a tunnel. Check the arrival board.</span></p>
      </div>
      <nav class="site-nav" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#player-states">States</a><a href="#keyboard">Keyboard</a>
      </nav>
      <div class="site-header-right">
        <div class="site-theme-switch" role="group" aria-label="Page theme">
          <button type="button" data-theme-choice="night" aria-pressed="true">Night</button>
          <button type="button" data-theme-choice="dawn" aria-pressed="false">Dawn</button>
          <button type="button" data-theme-choice="fog" aria-pressed="false">Fog</button>
        </div>
      </div>
    </header>

    <main id="main-content">
      <section class="site-hero" id="top" aria-labelledby="site-title">
        <div class="site-hero-city" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
        <div class="site-hero-train" aria-hidden="true"><i></i><i></i><b></b><em></em></div>
        <div class="site-container site-hero-inner">
          <p class="site-eyebrow"><span class="site-eyebrow-dot" aria-hidden="true"></span> Video.js 10 skin · Night service</p>
          <h1 id="site-title">Night<br class="site-title-break"> Train<span>.</span></h1>
          <p class="site-hero-instruction">Your seek bar has a departure time.<br>All aboard.</p>
          <a class="site-ticket-button" href="#live-player">Board the train <span aria-hidden="true">↓</span></a>
          <div class="site-player-frame" id="live-player">
            <span class="site-frame-rivet site-frame-rivet--tl" aria-hidden="true"></span><span class="site-frame-rivet site-frame-rivet--tr" aria-hidden="true"></span>
            <span class="site-frame-rivet site-frame-rivet--bl" aria-hidden="true"></span><span class="site-frame-rivet site-frame-rivet--br" aria-hidden="true"></span>
            <span class="site-curtain site-curtain--left" aria-hidden="true"></span><span class="site-curtain site-curtain--right" aria-hidden="true"></span>
            <div class="site-player-mount" data-player-mount="hero" aria-label="Night Train live player"></div>
            <div class="site-brass-plate"><span>Service 10:05</span><b>Platform 2</b></div>
          </div>
          <p class="site-player-caption"><span class="site-live-dot" aria-hidden="true"></span> Live Mux sample <span>·</span> Cosmic Dawn</p>
          <p class="site-service-caption">Service 10:05 · Platform 2</p>
          <div class="site-hero-stats"><span><b>01</b> railway seek bar</span><span><b>05</b> station stops</span><span><b>10</b> Video.js</span></div>
        </div>
      </section>

      <section class="site-section site-how" id="how-it-works" aria-labelledby="how-title">
        <div class="site-container">
          <div class="site-section-heading"><span class="site-section-number">01</span><div><p class="site-eyebrow">From controls to carriage</p><h2 id="how-title">Everything<br>has a place.</h2></div></div>
          <p class="site-section-intro">Hover or focus a tile. The ordinary control on one side becomes railway kit on the other.</p>
          <div class="site-map-grid">${howCards.map(([number, control, railway, icon]) => `
            <button class="site-map-tile" type="button" aria-label="${control} maps to ${railway}">
              <span class="site-map-tile-inner"><span class="site-map-face site-map-front"><small>${number} · VIDEO CONTROL</small><b>${control}</b><i aria-hidden="true">${icon}</i></span><span class="site-map-face site-map-back"><small>RAILWAY DETAIL</small><b>${railway}</b><i aria-hidden="true">↗</i></span></span>
            </button>`).join('')}
          </div>
        </div>
      </section>

      <section class="site-section site-features" id="features" aria-labelledby="features-title">
        <div class="site-container">
          <div class="site-section-heading"><span class="site-section-number">02</span><div><p class="site-eyebrow">Try the little details</p><h2 id="features-title">All the<br>working parts.</h2></div></div>
          <p class="site-section-intro">Pull a lever, move a dial, send the train through a tunnel. These are real controls with tiny jobs.</p>
          <div class="site-feature-grid">
            <article class="site-ticket site-ticket--lane"><span class="site-ticket-number">TICKET 001</span><h3>Move the mini train</h3><p>Scrub the line from depot to last stop.</p><div class="site-mini-lane"><span class="site-mini-rail"></span><span class="site-mini-train" data-demo-train aria-hidden="true"><i></i><i></i><b></b></span></div><label class="site-range-label" for="demo-lane">Journey</label><input id="demo-lane" data-track-demo type="range" min="0" max="100" value="18" aria-label="Move the mini train"></article>
            <article class="site-ticket site-ticket--gauge"><span class="site-ticket-number">TICKET 002</span><h3>Set the pressure</h3><p>Turn the small dial to set its reading.</p><div class="site-demo-gauge" data-demo-gauge aria-hidden="true"><i></i><b></b></div><label class="site-range-label" for="demo-pressure">Pressure <output data-pressure-output>70%</output></label><input id="demo-pressure" data-gauge-demo type="range" min="0" max="100" step="5" value="70" aria-label="Set demo pressure"></article>
            <article class="site-ticket site-ticket--signal"><span class="site-ticket-number">TICKET 003</span><h3>Change the signal</h3><p>Semaphore up: go. Arm down: wait.</p><div class="site-demo-signal" data-demo-signal="go" aria-hidden="true"><i></i><b></b></div><button class="site-demo-button" type="button" data-signal-demo aria-pressed="false">Signal: clear</button></article>
            <article class="site-ticket site-ticket--tunnel"><span class="site-ticket-number">TICKET 004</span><h3>Take the tunnel</h3><p>A ten second jump sends the player train through.</p><div class="site-demo-tunnel" aria-hidden="true"><i></i><b></b></div><button class="site-demo-button" type="button" data-tunnel-demo>Send it through</button></article>
            <article class="site-ticket site-ticket--clock"><span class="site-ticket-number">TICKET 005</span><h3>Set station time</h3><p>Move the hands to the next chapter.</p><div class="site-demo-clock" data-demo-clock style="--demo-clock-angle: 40deg" aria-hidden="true"><i></i><b></b></div><label class="site-range-label" for="demo-clock">Departure time</label><input id="demo-clock" data-clock-demo type="range" min="0" max="100" value="40" aria-label="Set demo station clock"></article>
          </div>
        </div>
      </section>

      <section class="site-section site-states" id="player-states" aria-labelledby="states-title">
        <div class="site-container">
          <div class="site-section-heading"><span class="site-section-number">03</span><div><p class="site-eyebrow">One player, five signals</p><h2 id="states-title">Pick a<br>train state.</h2></div></div>
          <p class="site-section-intro">These buttons change the sample player. Error stops the train at a red signal; Try again reloads it.</p>
          <div class="site-state-mount" data-player-mount="states"></div>
        </div>
      </section>

      <section class="site-section site-keyboard" id="keyboard" aria-labelledby="keyboard-title">
        <div class="site-container">
          <div class="site-section-heading"><span class="site-section-number">04</span><div><p class="site-eyebrow">Hands on the controls</p><h2 id="keyboard-title">Keyboard<br>operator.</h2></div></div>
          <p class="site-section-intro">Focus the player, then press a key. The keycap lights up when the real shortcut fires.</p>
          <div class="site-key-groups">
            <div class="site-key-group"><h3>Run the train</h3><button type="button" class="site-keycap" data-keycap="space"><kbd>Space</kbd><span>Play / pause</span></button><button type="button" class="site-keycap" data-keycap="k"><kbd>K</kbd><span>Play / pause</span></button><button type="button" class="site-keycap" data-keycap="j"><kbd>J</kbd><span>Back 10s</span></button><button type="button" class="site-keycap" data-keycap="l"><kbd>L</kbd><span>Forward 10s</span></button><button type="button" class="site-keycap" data-keycap="home"><kbd>Home</kbd><span>Start</span></button><button type="button" class="site-keycap" data-keycap="end"><kbd>End</kbd><span>End</span></button></div>
            <div class="site-key-group"><h3>Find a station</h3><button type="button" class="site-keycap" data-keycap="arrowleft"><kbd>← / →</kbd><span>Seek 5s · gauge volume 5%</span></button><button type="button" class="site-keycap" data-keycap="pageup"><kbd>Page Up</kbd><span>Previous station</span></button><button type="button" class="site-keycap" data-keycap="pagedown"><kbd>Page Down</kbd><span>Next station</span></button></div>
            <div class="site-key-group"><h3>Player signals</h3><button type="button" class="site-keycap" data-keycap="arrowup"><kbd>↑ / ↓</kbd><span>Volume 5%</span></button><button type="button" class="site-keycap" data-keycap="m"><kbd>M</kbd><span>Mute</span></button><button type="button" class="site-keycap" data-keycap="c"><kbd>C</kbd><span>Captions</span></button><button type="button" class="site-keycap" data-keycap="f"><kbd>F</kbd><span>Fullscreen</span></button></div>
            <div class="site-key-group"><h3>Get around</h3><button type="button" class="site-keycap" data-keycap="escape"><kbd>Esc</kbd><span>Close menu, sheet or guide</span></button><button type="button" class="site-keycap" data-keycap="?"><kbd>?</kbd><span>Shortcut guide</span></button><button type="button" class="site-keycap" data-keycap="tab"><kbd>Tab / Shift+Tab</kbd><span>Next / previous control</span></button><button type="button" class="site-keycap" data-keycap="enter"><kbd>Enter / Space</kbd><span>Activate a button</span></button></div>
          </div>
          <p class="site-key-hint">Shortcuts work while focus is inside the player. The full cheat sheet is behind <kbd>?</kbd>.</p>
        </div>
      </section>

      <section class="site-section site-use" id="use-it" aria-labelledby="use-title">
        <div class="site-container">
          <div class="site-section-heading"><span class="site-section-number">05</span><div><p class="site-eyebrow">Make a railway of your own</p><h2 id="use-title">Your route<br>starts here.</h2></div></div>
          <div class="site-use-steps">
            <article class="site-use-step"><span class="site-step-flap">01</span><div><h3>Make a skin</h3><p>Start with the Video.js HTML skin generator.</p><pre><code>npx @videojs/cli skin create</code></pre><button type="button" class="site-copy-button" data-copy="npx @videojs/cli skin create">Copy command</button></div></article>
            <article class="site-use-step"><span class="site-step-flap">02</span><div><h3>Shape the carriage</h3><p>Give real media controls a railway coat of paint.</p><pre><code>src/video/skin.css</code></pre><button type="button" class="site-copy-button" data-copy="src/video/skin.css">Copy path</button></div></article>
            <article class="site-use-step"><span class="site-step-flap">03</span><div><h3>Take a look around</h3><p>Run the local workbench, then tune the route.</p><pre><code>npm run dev</code></pre><button type="button" class="site-copy-button" data-copy="npm run dev">Copy command</button></div></article>
          </div>
          <a class="site-guide-link" href="https://videojs.org/docs/framework/html/guides/build-your-own-skin">Read the Video.js skin guide <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-container site-footer-inner"><div><p class="site-eyebrow">End of the line</p><h2>Thanks for riding.</h2><p>Mind the platform gap on your way out.</p><p class="site-credit">skin by dev sharma</p></div><div class="site-footer-actions"><a href="#top">Back to the top ↑</a><button type="button" class="site-ticket-button" data-run-again>Run again ↻</button></div></div>
      <div class="site-footer-track" aria-hidden="true"><span></span></div>
    </footer>
  </div>`;

const heroMount = root.querySelector<HTMLElement>('[data-player-mount="hero"]');
const statesMount = root.querySelector<HTMLElement>('[data-player-mount="states"]');
let heroPlayer: HTMLElement | null = null;
if (heroMount) {
  heroPlayer = createNightTrainPlayer({ autoplay: false, preload: 'auto' });
  heroPlayer.classList.add('site-hero-player');
  heroMount.append(heroPlayer);
}
if (statesMount) {
  const player = createNightTrainPlayer({ stateControls: true, preload: 'metadata' });
  player.classList.add('site-state-demo-player');
  statesMount.append(player);
}

const formatTime = (): string => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
const clock = root.querySelector<HTMLElement>('#site-clock');
const updateClock = (): void => { if (clock) clock.textContent = formatTime(); };
updateClock();
window.setInterval(updateClock, 1000);

root.querySelectorAll<HTMLButtonElement>('[data-theme-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    const theme = button.dataset.themeChoice;
    if (!theme) return;
    document.body.dataset.pageTheme = theme;
    root.querySelectorAll<HTMLButtonElement>('[data-theme-choice]').forEach((choice) => choice.setAttribute('aria-pressed', String(choice === button)));
  });
});

const trackDemo = root.querySelector<HTMLInputElement>('[data-track-demo]');
const miniTrain = root.querySelector<HTMLElement>('[data-demo-train]');
const miniLane = miniTrain?.parentElement;
const updateMiniTrainPosition = (): void => {
  if (!trackDemo || !miniTrain || !miniLane) return;
  const range = Number(trackDemo.max) - Number(trackDemo.min) || 1;
  const progress = Math.max(0, Math.min(1, (Number(trackDemo.value) - Number(trackDemo.min)) / range));
  const travel = Math.max(0, miniLane.clientWidth - miniTrain.offsetWidth);
  miniTrain.style.setProperty('--demo-train-position', `${travel * progress}px`);
};
trackDemo?.addEventListener('input', updateMiniTrainPosition);
updateMiniTrainPosition();
if (miniLane) new ResizeObserver(updateMiniTrainPosition).observe(miniLane);

const gaugeDemo = root.querySelector<HTMLInputElement>('[data-gauge-demo]');
const demoGauge = root.querySelector<HTMLElement>('[data-demo-gauge]');
gaugeDemo?.addEventListener('input', () => {
  const value = Number(gaugeDemo.value);
  demoGauge?.style.setProperty('--demo-gauge-angle', `${-90 + value * 1.8}deg`);
  const output = root.querySelector<HTMLElement>('[data-pressure-output]');
  if (output) output.textContent = `${value}%`;
});

root.querySelector<HTMLButtonElement>('[data-signal-demo]')?.addEventListener('click', (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  const stop = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(stop));
  button.textContent = stop ? 'Signal: stop' : 'Signal: clear';
  root.querySelector<HTMLElement>('[data-demo-signal]')?.setAttribute('data-demo-signal', stop ? 'stop' : 'go');
});

root.querySelector<HTMLButtonElement>('[data-tunnel-demo]')?.addEventListener('click', () => {
  heroPlayer?.querySelector<HTMLElement>('.tn-skip-button[seconds="10"]')?.click();
});

const clockDemo = root.querySelector<HTMLInputElement>('[data-clock-demo]');
clockDemo?.addEventListener('input', () => root.querySelector<HTMLElement>('[data-demo-clock]')?.style.setProperty('--demo-clock-angle', `${Number(clockDemo.value) * 3.6}deg`));

root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy ?? '';
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'Copied ✓';
    } catch {
      const field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
      button.textContent = 'Copied ✓';
    }
    window.setTimeout(() => { button.textContent = button.dataset.copy?.startsWith('src/') ? 'Copy path' : 'Copy command'; }, 1400);
  });
});

const keyNames: Record<string, string> = { ' ': 'space', arrowleft: 'arrowleft', arrowright: 'arrowleft', arrowup: 'arrowup', arrowdown: 'arrowup', pageup: 'pageup', pagedown: 'pagedown', escape: 'escape', enter: 'enter', tab: 'tab' };
document.addEventListener('keydown', (event) => {
  const player = event.target instanceof Element ? event.target.closest('.night-train-skin') : null;
  if (!player) return;
  const name = keyNames[event.key.toLowerCase()] ?? event.key.toLowerCase();
  root.querySelectorAll<HTMLElement>('[data-keycap]').forEach((keycap) => keycap.toggleAttribute('data-pressed', keycap.dataset.keycap === name));
  window.setTimeout(() => root.querySelectorAll<HTMLElement>('[data-keycap][data-pressed]').forEach((keycap) => keycap.removeAttribute('data-pressed')), 220);
});

root.querySelector<HTMLButtonElement>('[data-run-again]')?.addEventListener('click', () => {
  const playerRoot = heroPlayer?.querySelector<HTMLElement>('.night-train-skin');
  const playButton = playerRoot?.querySelector<HTMLElement>('.tn-play-button');
  if (!playerRoot || !playButton) return;
  playerRoot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
  if (playButton.hasAttribute('data-paused') || playButton.hasAttribute('data-ended')) playButton.click();
  document.querySelector('#top')?.scrollIntoView({ block: 'start' });
});
