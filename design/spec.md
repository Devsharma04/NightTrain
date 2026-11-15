# Night Train skin design

Reference: the user-provided “Night Train” boards in the supplied Claude canvas, observed in Chrome on 2026-11-14. Desktop, mobile, and player-state artboards were visible together. The written handoff supplies the exact token values and most measurements; those values are recorded as user preferences. Details not specified in the handoff are derived from the visible board.

## Decisions

- Video.js 10.4 HTML skin, plain CSS, video preset, Scaffold foundation.
- Desktop control order: Play, Back 10 seconds, Forward 10 seconds, next station, Mute, volume lane, Playback speed, Quality, Captions, Fullscreen.
- Mobile: full-width lane; Departed, next station, Arrives; Play, back, forward, Mute, Captions, Fullscreen; then full-width Playback speed and Quality controls. Volume lane is hidden on touch and narrow layouts.
- Menus open above their triggers, use Video.js menu and radio-group controls, and keep Escape and arrow-key behavior.
- Existing Video.js scaffold icons stay in one consistent set. The track and train are CSS-built decorative parts.
- Barlow Condensed 600/700 is used for labels; JetBrains Mono 700 is used for time digits. Both have system fallbacks.
- Dark night-blue surfaces, amber progress and active states, chalk text, and opaque enamel signs keep controls legible over video.
- The seek lane is the Video.js time slider. Its sleeper pattern, stations, train, signal, and buffer stop are decorative and hidden from assistive technology.
- Paused, buffering, and ended copy is shown in static state panels. Only the buffering lamp pulses, and only when reduced motion is not requested.
- The preview keeps the scaffold’s public video source and chapter track, with the chapter track extended to five station positions.

## Measurements

| Item | Value | Source |
| --- | --- | --- |
| Desktop reference | 960 × 600 px | User handoff |
| Mobile reference | 390 px wide; breakpoint 640 px | User handoff |
| Player frame | 14 px radius, 3 px steel border | User handoff |
| Control bar | 14 px / 24 px / 18 px padding; 3 px steel top border; 12 px row gap | User handoff |
| Standard buttons | At least 48 × 48 px, 10 px radius, 2 px steel border | User handoff |
| Play lamp | 64 × 64 px; 3 px lamp border; 6 px amber halo | User handoff |
| State replay lamp | 72 px | User handoff |
| Seek lane | 56 px hit area; sleepers at y=32–48; rails at y=36–44 | User handoff |
| Station markers | 18 px square; 2 × 16 px post; positions 14%, 34%, 55%, 76%, 91% | User handoff |
| Train | Locomotive 46 × 24 px; two 30 × 24 px carriages; 2 px gaps | User handoff |
| Departure digits | 26 × 40 px desktop; 20 × 32 px mobile; 4 px radius; 2 px split line | User handoff |
| Labels | 16 px buttons; 11–12 px small labels with .16em tracking | User handoff |
| Platform sign | 8 px padding / 14 px horizontal padding; 8 px radius; 3 px chalk border; title 30 px desktop / 20 px mobile | User handoff |
| Menu | 230 px wide; 48 px rows; 2 px chalk border; 10 px radius | User handoff |
| Focus ring | 3 px white, 3 px offset | User handoff |
| Typography | Barlow Condensed 600/700; JetBrains Mono 700 | User handoff |
| Tooltip and seek preview | Above the lane; exact position derived from the Video.js component boundary | Derived; no numeric offset was specified |
| Focus, buffering, pause, and ended panels | Match the same night, enamel, amber, chalk, and signal tokens | Derived from the user’s state boards |

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| night | `#0E1424` | Digit tiles and dark text on amber |
| panel | `#151C30` | Control bar and menus |
| button | `#1F2944` | Secondary buttons |
| steel | `#6F7FA3` | Unlit rails, sleepers, and borders |
| steel-light | `#8FA0C8` | Buffered rails and carriage borders |
| amber | `#FFB84D` | Lit track, play lamp, selected rows, and digits |
| lamp | `#FFE29A` | Amber outlines and train windows |
| signal | `#FF6B5E` | Buffering and stop lamps |
| chalk | `#F2EFE6` | Main text and sign borders |
| muted | `#B8C2DC` | Small labels |
| enamel | `#1B2A5C` | Platform sign background |
| focus | `#FFFFFF` | Focus rings |

