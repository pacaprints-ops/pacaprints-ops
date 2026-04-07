# THEMES RULEBOOK (PacaPrints)

Purpose: Provide consistent styling rules based on THEME_SELECTED.
Apply the matching THEME block. If not found, use THEME:DEFAULT.
If THEME_SELECTED is "none", treat as DEFAULT.

## INPUT
THEME_SELECTED: {{THEME}}

## GLOBAL THEME RULES (apply to all themes)
- Product is always the hero: design fully visible, legible, not cropped.
- Props/background must never overpower the product.
- No copyrighted characters, logos, or brand names.
- Keep scenes tidy, realistic, premium.
- Avoid busy patterns behind the product.

---

## THEME:DEFAULT
Use when THEME_SELECTED is unknown or "none".
VIBE: clean, modern, minimal, soft studio aesthetic
PALETTE: neutral whites/creams + subtle teal accents
PROPS_ALLOWED: minimal stationery textures, subtle plant
PROPS_BANNED: seasonal icons unless theme explicitly requires
NOTES: safe fallback

---

## THEME:BIRTHDAY
VIBE: celebratory, fun, bright-but-not-neon
PALETTE: balanced brights + white space
PROPS_ALLOWED: subtle confetti, minimal streamers, small candle hint, gift ribbon
PROPS_BANNED: giant balloons, messy party clutter, alcohol
BACKGROUND_STYLE: light, cheerful, clean surface
NOTES: classy and minimal

---

## THEME:VALENTINES
VIBE: romantic or cheeky (tasteful)
PALETTE: reds/pinks + neutrals; avoid over-saturation
PROPS_ALLOWED: small hearts, minimal rose petals, ribbon, envelope seals, soft florals
PROPS_BANNED: explicit/sexual props, lingerie, overly tacky decor
BACKGROUND_STYLE: warm soft light, minimal props
NOTES: premium, subtle romantic cues

---

## THEME:MOTHERS_DAY
VIBE: warm, caring, thoughtful, premium gift feel
PALETTE: cream, blush, sage, soft lilac
PROPS_ALLOWED: gentle florals, ribbon, tea cup (unbranded), soft fabrics
PROPS_BANNED: novelty clutter, tacky banners
BACKGROUND_STYLE: calm home feel, tidy, natural light
NOTES: elegant + heartfelt

---

## THEME:FATHERS_DAY
VIBE: modern, confident, understated
PALETTE: navy/charcoal/earth tones + neutrals
PROPS_ALLOWED: minimal desk items, wood/leather textures (unbranded)
PROPS_BANNED: alcohol, tool mess, sports logos
BACKGROUND_STYLE: clean desk / wood surface, masculine-neutral styling
NOTES: avoid stereotypes, keep premium

---

## THEME:BABY
VIBE: soft, gentle, calm
PALETTE: creams + pastel blue/pink/yellow + sage
PROPS_ALLOWED: muslin cloth, generic soft toy (no brands), neutral blocks (no letters)
PROPS_BANNED: branded characters, loud colours, clutter
BACKGROUND_STYLE: airy, minimal nursery styling
NOTES: soft textures, lots of whitespace

---

## THEME:CHRISTMAS
VIBE: festive, cozy, premium
PALETTE: warm neutrals + deep green/red accents (subtle)
PROPS_ALLOWED: tiny bauble hint, pine sprig, warm fairy-light bokeh (soft), ribbon
PROPS_BANNED: busy santa imagery, cartoon characters, cluttered decorations
BACKGROUND_STYLE: warm light, cozy textures (linen/wood)
NOTES: subtle seasonal cues only

---

## THEME:EASTER
VIBE: spring, fresh, light
PALETTE: pastel spring tones + neutrals
PROPS_ALLOWED: small eggs, subtle spring florals, light greenery
PROPS_BANNED: huge rabbits, busy baskets, cartoon-branded props
BACKGROUND_STYLE: bright natural light, spring table styling
NOTES: minimal seasonal hints

---

## THEME:HALLOWEEN
VIBE: spooky-cute, modern, not gory
PALETTE: black/charcoal + muted orange/purple accents
PROPS_ALLOWED: subtle cobweb hint, tiny pumpkin, candle glow (unbranded)
PROPS_BANNED: gore, weapons, horror IP characters, overly scary visuals
BACKGROUND_STYLE: moody lighting, clean styling
NOTES: keep it playful + tasteful

---

## THEME:KIDS
VIBE: playful, colourful, clean
PALETTE: bright friendly colours with whitespace
PROPS_ALLOWED: simple toy shapes (generic), playful textures, colour pops
PROPS_BANNED: branded characters/logos, clutter, messy scenes
BACKGROUND_STYLE: bright, tidy, child-friendly
NOTES: keep design legible; no chaos

---

## THEME:GAMING
VIBE: modern, neon-accented but controlled
PALETTE: dark neutrals + subtle neon accent glow (minimal)
PROPS_ALLOWED: generic controller silhouette (no logos), RGB glow ambiance, desk setup (unbranded)
PROPS_BANNED: console/brand logos, specific game IP characters, clutter
BACKGROUND_STYLE: clean gaming desk vibe, controlled lighting
NOTES: premium, not messy “teen cave”

---

## THEME:WEDDING
VIBE: elegant, romantic, luxury stationery suite feel
PALETTE: whites/creams + soft neutrals (sage, blush, taupe)
PROPS_ALLOWED: silk ribbon, wax seal (generic), delicate florals, linen textures
PROPS_BANNED: tacky banners, confetti overload, branded items
BACKGROUND_STYLE: luxury flatlay or clean lifestyle
NOTES: timeless and upscale


If EXTRA_PROMPTS specifies recipient (man/woman/husband/wife/boy/girl), adjust palette/props to match recipient while still staying within the theme (e.g., birthday but neutral/masculine styling)
