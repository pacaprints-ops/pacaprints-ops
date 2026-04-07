# ROOMS RULEBOOK (PacaPrints)

Purpose: Provide consistent environment styling based on ROOM_SELECTED.
Apply the matching ROOM block. If not found, use ROOM:DEFAULT.

## INPUT
ROOM_SELECTED: {{ROOM}}

## GLOBAL ROOM RULES (apply to all rooms)
- Product is the hero: fully visible, legible, not cropped.
- Room is suggested via lighting, textures, surfaces, minimal props.
- Keep scenes tidy and realistic. No clutter.
- No brand logos or readable brand text on props.

---

## ROOM:DEFAULT
LIGHTING: bright natural light, soft shadows
SURFACES: light wood or white desk
PROPS_ALLOWED: minimal stationery, subtle plant
BACKGROUND: clean neutral modern wall

---

## ROOM:LOUNGE
LIGHTING: warm natural light, cozy
SURFACES: coffee table wood / neutral fabric texture
PROPS_ALLOWED: small plant, neutral candle (unbranded), subtle throw texture
BACKGROUND: soft furnishings hinted (blurred sofa/neutral wall)
NOTES: comfortable, not staged

---

## ROOM:KITCHEN
LIGHTING: bright, clean daylight
SURFACES: light worktop (stone/wood)
PROPS_ALLOWED: ceramic mug (unbranded), plain tea towel, small plant
BACKGROUND: clean backsplash hints (blurred)
NOTES: avoid food mess

---

## ROOM:NURSERY
LIGHTING: airy, soft daylight
SURFACES: light wood / soft fabric
PROPS_ALLOWED: muslin cloth, generic soft toy (no brands), neutral blocks (no letters)
BACKGROUND: cream/sage/pastel tones, blurred decor
NOTES: gentle + minimal

---

## ROOM:BATHROOM
LIGHTING: bright, crisp, spa-like
SURFACES: light stone/marble counter
PROPS_ALLOWED: rolled towel (plain), small plant, simple soap dispenser (unbranded)
BACKGROUND: neutral tiles / soft mirror blur
NOTES: clean, minimal

---

## ROOM:BEDROOM
LIGHTING: soft, calm, slightly warm
SURFACES: bedside table / light wood
PROPS_ALLOWED: linen texture, small plant, subtle lamp glow (unbranded)
BACKGROUND: blurred bedding/neutral headboard tones
NOTES: calm + tidy

---

## ROOM:OFFICE
LIGHTING: clean daylight, modern
SURFACES: desk (wood/white)
PROPS_ALLOWED: minimal stationery, closed laptop (no logo), desk plant
BACKGROUND: neutral wall, tidy workspace hints
NOTES: professional, uncluttered

---

## ROOM:GIRLS_BEDROOM
LIGHTING: soft, bright, cheerful
SURFACES: light wood/white desk or bedside
PALETTE_HINT: blush/lilac/sage accents (subtle)
PROPS_ALLOWED: subtle hair bow shape, soft cushion texture, small plant, minimal decor
BACKGROUND: light wall with gentle colour accents (blurred)
NOTES: avoid stereotypes; keep modern + clean

---

## ROOM:BOYS_BEDROOM
LIGHTING: soft, bright, clean
SURFACES: light wood/white desk or bedside
PALETTE_HINT: navy/teal/grey accents (subtle)
PROPS_ALLOWED: minimal desk items, subtle sporty shapes without logos, small plant
BACKGROUND: neutral wall with cool-toned accents (blurred)
NOTES: avoid stereotypes; keep modern + clean

If EXTRA_PROMPTS specifies recipient (man/woman/husband/wife/boy/girl), adjust palette/props to match recipient while still staying within the theme (e.g., birthday but neutral/masculine styling)
