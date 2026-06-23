# Change 02 — Motion & dynamic polish

Goal: signal "simple but well-designed" through **quiet, editorial motion** — felt more than
noticed. Nothing here should delay reading or draw attention to itself. All of it layers on top
of the existing design without changing layout, color, or copy.

> **Global rule — honor reduced motion.** Wrap every animation so it's disabled when the user
> opts out. Respecting this *is itself* a craft signal.
> ```css
> @media (prefers-reduced-motion: reduce) {
>   *, *::before, *::after {
>     animation-duration: 0.001ms !important;
>     animation-iteration-count: 1 !important;
>     transition-duration: 0.001ms !important;
>     scroll-behavior: auto !important;
>   }
> }
> ```
> Easing: use `cubic-bezier(0.2, 0.7, 0.2, 1)` (call it `--ease`) for entrances. No bouncy/
> spring easings — they read as playful, not editorial.

---

## Tier 1 — Do these (touch every page, high signal, zero performance cost)

### 1. Theme-toggle icon swap
The toggle currently flips `data-theme` with a 0.25s bg/color transition. Add a moon↔sun icon
that animates on switch.

- Render **both** a moon and a sun SVG in the button, stacked (grid, same cell).
- Show moon in light mode (click → go dark), sun in dark mode. Cross-fade + a small rotate/scale:
```css
.theme-toggle svg { grid-area: 1/1; transition: opacity .25s var(--ease), transform .35s var(--ease); }
.theme-toggle .ico-sun  { opacity: 0; transform: rotate(-90deg) scale(.6); }
.theme-toggle .ico-moon { opacity: 1; transform: rotate(0)      scale(1);  }
html[data-theme="dark"] .theme-toggle .ico-sun  { opacity: 1; transform: rotate(0)     scale(1);  }
html[data-theme="dark"] .theme-toggle .ico-moon { opacity: 0; transform: rotate(90deg) scale(.6); }
```
- Keep the whole-page `transition: background .25s, color .25s` already in place.
- This is the single most "designed" micro-moment on the site — get it crisp.

### 2. Staggered entrance on first paint
Each page's main sections fade up slightly, in sequence, once on load.

```css
@keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
[data-rise] { animation: rise .5s var(--ease) both; }
```
Apply `data-rise` to the top-level blocks and stagger with an inline delay or `:nth-child`:
- About: nav (no anim) → `01 About` label, then H1/name, then body, then `02 Career`, then
  `03 Writing`. Delays ~0, 60, 120, 200, 280 ms.
- Blog / Contact: header label → H1 → intro → cards/panel. Same ~60–80ms steps.
- Blog post: kicker → H1 → byline → hero → body. Same.

Keep delays small (cap ~300ms total) so the page never feels slow. **First paint only** — do not
re-run on theme toggle or navigation within a page.

### 3. Link underline draw (nav + inline links)
Underline grows from the left on hover. Animate `background-size`, never `width` (no reflow).

```css
.ul-link {
  background-image: linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;
  transition: background-size .28s var(--ease);
  padding-bottom: 2px;
}
.ul-link:hover { background-size: 100% 1px; }
```
- Apply to nav items (inactive ones) and inline body links in posts.
- The **active** nav item keeps its solid accent color (no draw needed).
- Inline post links already use an accent underline — switch them to this draw-on-hover.

---

## Tier 2 — Strongly recommended signature moments

### 4. Card hover lift (Blog index)
Communicates interactivity without noise.
```css
.post-card {
  transition: transform .18s var(--ease), box-shadow .18s var(--ease), border-color .18s var(--ease);
}
.post-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 6px 20px rgba(0,0,0,.06);
}
```
Dark mode: same transform, soften shadow (`rgba(0,0,0,.3)`), border → `var(--accent)`.
Featured card gets the same treatment at a slightly smaller lift (`-1px`).

### 5. Timeline scroll-reveal (About — the signature element)
The career timeline is the site's most distinctive component, so it earns one scroll moment.
As the timeline enters the viewport: the vertical rail "draws" downward and each node pops in,
staggered top → bottom.

- Use an `IntersectionObserver` (threshold ~0.2) that adds a `.in` class to the timeline once,
  then unobserves. No scroll-jacking, no per-frame JS.
```css
.tl-rail   { transform: scaleY(0); transform-origin: top; transition: transform .7s var(--ease); }
.tl-node   { opacity: 0; transform: scale(.5); transition: opacity .4s var(--ease), transform .4s var(--ease); }
.tl-row    { opacity: 0; transform: translateY(10px); transition: opacity .5s var(--ease), transform .5s var(--ease); }
.timeline.in .tl-rail { transform: scaleY(1); }
.timeline.in .tl-node { opacity: 1; transform: scale(1); }
.timeline.in .tl-row  { opacity: 1; transform: none; }
/* stagger rows: */
.timeline.in .tl-row:nth-child(1){ transition-delay:.05s } /* 2→.15s, 3→.25s, 4→.35s */
```
```js
const tl = document.querySelector('.timeline');
if (tl) {
  const io = new IntersectionObserver((e) => {
    if (e[0].isIntersecting) { tl.classList.add('in'); io.disconnect(); }
  }, { threshold: 0.2 });
  io.observe(tl);
}
```
- The current-role (Careem) node keeps its accent ring; let it pop last/most.
- If the timeline is already in view on load, it animates immediately — that's fine.

### 6. Reading progress bar (Blog post only)
Thin accent line at the very top that fills with scroll depth. Useful on long reads, and a
familiar "considered" detail.
```css
.read-progress { position: fixed; top: 0; left: 0; height: 2px; width: 0; background: var(--accent); z-index: 50; }
```
```js
const bar = document.querySelector('.read-progress');
addEventListener('scroll', () => {
  const h = document.documentElement;
  const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
  bar.style.width = (p * 100) + '%';
}, { passive: true });
```
Keep it to **2px** and accent only — anything thicker fights the editorial tone.

---

## Tier 3 — Static polish that reads as "designed" (no JS, do these too)

- `text-wrap: balance` on all headings (`h1`, `h2`); `text-wrap: pretty` on body paragraphs.
- Custom selection color (already have the token): `::selection { background: var(--accent-soft); }`.
- Sticky nav: on scroll past ~8px, strengthen the bottom border / add a faint shadow so it
  detaches from the page. Toggle a `.scrolled` class via a scroll listener (passive).
- Buttons/links: `transition: color .15s, background .15s` so accent changes ease in, never snap.
- Focus-visible rings in accent for keyboard users (`:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`).

---

## Do NOT add (these counter-signal "well designed" for an editorial site)
- Parallax, scroll-jacking, pinned/scrubbed sections.
- Bouncy/spring/elastic easings; long (>0.6s) transitions on common interactions.
- Blur-in or letter-by-letter text reveals; typewriter effects.
- Auto-playing carousels, animated gradients, particle/canvas backgrounds.
- Anything that delays the reader getting to the text, or that re-animates on every scroll.

---

## Priority if you only do a few
1. Theme-toggle icon swap (Tier 1.1)
2. Staggered entrance (Tier 1.2)
3. Link underline draw (Tier 1.3)
4. Timeline scroll-reveal (Tier 2.5) — the signature moment

All four are cheap, touch every page (or the standout component), respect reduced motion, and
never get in the way of reading.
