# Learn Everything — Brand Kit

The mark is a **terminal prompt inside a square frame**: the sandbox you learn in.
A chevron, a cursor, a hairline border. Nothing else.

Everything here is monochrome on purpose — the product UI follows the same
rules, so the brand and the interface read as one system.

## Files

| File | Use |
|---|---|
| `learn-everything-mark.svg` | Primary mark. Hairline frame + prompt. Use on the linen canvas. |
| `learn-everything-mark-solid.svg` | Solid walnut square, prompt knocked out. Favicons, app icons, small placements. |
| `learn-everything-mark-reversed.svg` | Linen on walnut. Dark panels, footers, slides. |
| `learn-everything-wordmark.svg` | The name only, with the hairline underline. Live text (see below). |
| `learn-everything-lockup-horizontal.svg` | Mark + wordmark, side by side. |
| `learn-everything-lockup-stacked.svg` | Mark above the wordmark, for square placements. |
| `favicon.svg` | The solid mark, sized for a browser tab. |

The app also ships `src/app/icon.svg` (tab icon) and `src/app/apple-icon.png`
(180×180, generated from the same geometry).

## Colours

| Name | Value | Use |
|---|---|---|
| Walnut Ink | `#403a34` | Mark, wordmark, borders, filled controls |
| Linen Canvas | `#f6f1eb` | Background, the knock-out in the solid mark |
| Charcoal Note | `#333333` | Body copy |
| Slate Whisper | `#555555` | Metadata, labels |

There is no accent colour. The system is two neutrals plus a charcoal.

## Type

BwGradual is the intended face; **Inter** is the substitute (it ships with the
app). The wordmark SVGs use live `<text>` with a fallback stack, so they
inherit the host's font — outline the type before sending it to a printer.

## Usage rules

**Clear space** — keep a margin of half the mark's width (24 units on the
48-unit grid) around the mark or lockup. Nothing enters it: no text, no rule,
no other logo.

**Minimum size** — 16px for the solid mark, 20px for the outlined mark, 96px
wide for the wordmark, 160px wide for the horizontal lockup. Below that, use
the solid mark alone.

**The wordmark** is always the name set in the sans face with a single hairline
underline. Do not set it in a different face, weight or case.

## Don't

- Don't round the corners of anything — square edges are the system.
- Don't add a shadow, a gradient, a glow or a second colour.
- Don't recolour the mark outside walnut and linen.
- Don't stretch, rotate or outline the mark.
- Don't separate the mark from the wordmark in a lockup.
- Don't set the name in a monospace face, even though the product is a terminal.
- Don't place the mark on a photograph without the reversed variant.

## Using it in code

```tsx
import { LogoMark, LogoSolid, LogoWordmark } from "@/components/brand/logo";

<LogoMark className="size-6" />        // inherits currentColor
<LogoSolid className="size-8" />       // square, knocked-out prompt
```

`LogoMark` and `LogoSolid` draw with `currentColor`, so they follow the theme
automatically — walnut ink on the linen canvas, and linen when the surface
flips in dark mode.
