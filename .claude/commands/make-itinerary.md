# Make Itinerary Page

Generate a styled HTML itinerary page for a girls trip / birthday weekend / hen do, based on form data provided by the user.

## How to use

Paste the form data into the chat after typing `/make-itinerary`, then I'll generate the HTML file.

## What to generate

Create a self-contained HTML file saved to `docs/[slug]-itinerary.html` where `[slug]` is a kebab-case version of the occasion name (e.g. `louise-40th-itinerary.html`).

## Style rules — follow these exactly

- Fonts: Playfair Display (headings) + Nunito (body) from Google Fonts
- Background: warm cream — adapt the shade slightly to suit the colour theme
- Day cards: 3-column grid on desktop, stacked on mobile
- Each day card has a gradient header, timeline with dot + connector line, section labels
- Bottom section: travel details (train OR car share, depending on transport type)
- Final tagline line in italics

## Colour theming

Map the user's colour theme to actual CSS colours. Examples:
- Gold / Champagne → `#C9A84C` / `#E8D080` gradients, cream background `#fdfaf3`
- Pink / Rose → `#b5536a` / `#d4849a` gradients, blush background `#fdf6f0`
- Purple / Lilac → `#9b5de5` / `#c77dff` gradients, lavender background `#f8f4ff`
- Blue / Navy → `#2c5f8a` / `#5b9dc9` gradients, light blue background `#f4f8fc`
- Green / Sage → `#3a9b7a` / `#5ec49e` gradients, mint background `#f4fdf8`
- Each day card should use a slightly different shade of the theme colour family for variety

## Emoji choices

Match emojis to the occasion:
- 40th birthday → 🎂 header, ✨ dividers
- Hen do → 👑 header, 🌸 dividers
- General birthday → 🎉 header, 🌟 dividers
- General girls trip → ✈️ header, 🥂 dividers
- Activities: use appropriate emojis (🍽️ dinner, ☕ breakfast, 🎬 tour, 🔐 escape room, 🏛️ sightseeing, 🚂 train, 🏨 hotel, etc.)

## Info strip

Below the header, show pill badges for: dates, accommodation, headcount, transport type.

## Travel section

- If transport = Train: show outbound train card (depart station + time, arrive + time, hotel note) and return card
- If transport = Car: show car share grid (Friday arriving, Sunday/Monday leaving) with driver + passengers per car

## Day card theme badges

Use the schedule vibe for each day badge (e.g. "✦ Arrival Day ✦", "✦ Cardiff Adventure ✦", "✦ Last Hurrah ✦"). Keep it short and fun.

## File naming

Save as `docs/[name-slug]-itinerary.html`. Use the person's name + occasion in the slug.

## Reference file

See `docs/hen-do-itinerary.html` (car share, hen do style) and `docs/louise-40th-itinerary.html` (train, birthday style) as reference for the expected output quality and structure.
