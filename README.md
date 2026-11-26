# Reen Business Centre Website

Bespoke, mobile-first hospitality & lifestyle website for **Reen Business Centre** along **Samfya Road in Mansa, Luapula Province, Zambia** (*Reen Lodge • Restaurant & Bar • Reen Mini Mart*).

## Key Features & Fixes

- **Works Locally (`file://`) & Hosted (`https://`)**: Uses a classic deferred script (`js/main.js`) rather than ES modules so double-clicking `index.html` directly from Windows Explorer runs 100% of JavaScript with zero CORS restrictions.
- **Navigation**:
  - **Desktop (`>= 992px`)**: Pure CSS horizontal inline navigation bar (no unnecessary Menu button).
  - **Mobile & Narrow Windows (`< 992px`)**: Animated hamburger-to-`X` button with a dropdown panel anchored directly beneath the button, dimmed backdrop, Escape support, and instant auto-close when any link is tapped.
- **Gallery Filter & Full Lightbox**: Smooth animated category tabs (`All Spaces`, `Reen Lodge & Grounds`, `Dining, Bar & Patio`, `Mini Mart`) with photo counts, plus a full-screen `<dialog>` photo viewer with **Next (`›`) / Previous (`‹`)**, slide counter (`1 / 9`), keyboard arrow support, and touch swipe.
- **Direct WhatsApp Inquiry Delivery (`0977 794 427`)**: Submitting the inquiry form immediately opens WhatsApp (`https://wa.me/260977794427`) pre-filled with the guest's name, contact details, chosen room/service, and message — with zero email popups or page reloads.
- **Low-Bandwidth Optimization**: Multi-size `540w` / `1024w` WebP `<picture>` delivery, native `loading="lazy"` + shimmer skeletons, `0 KB` map facade, and `sw.js` caching.
