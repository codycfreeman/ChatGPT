# MCYPAA Interactive Maps  🌉🗺️

This repository holds the self-contained HTML/SVG assets that power the
interactive **California** and **Bay-Area** maps embedded on  
[marinypaa.org](https://marinypaa.org/).

* **Pan & zoom** on desktop (mouse-drag / wheel / track-pad).  
* **Pinch-zoom** & drag on mobile, single-tap opens county links.  
* Fully offline — no external JS/CDN required.

---

## File guide

| File | What it is | How it connects |
|------|------------|-----------------|
| **`index.html`** | Stand-alone web page that inlines a chosen SVG, wires [panzoom](https://github.com/anvaka/panzoom) and adds desktop/mobile tap-logic. | - Loads **`panzoom.min.js`**<br>- Fetches **`usa-ca-optimized-viewbox.svg`** by default (change the filename to swap maps). |
| **`panzoom.min.js`** | Local, minified copy of *anvaka/panzoom* (≈ 3 KB). | Provides cross-browser zoom + pan. Keeping it local avoids CSP/CORS issues. |
| **`usa-ca-optimized-viewbox.svg`** | Full 58-county California map. Each county `<a>` carries `class="map-link"` and a live URL. | Rendered by `index.html` when you open the page or embed it in an `<iframe>`. |
| **`bay-area-na.svg`** *(example)* | 10-county Bay-Area extract with NA links. | Swap the `fetch()` path in `index.html` (or make a copy of the page) to display this regional map. |

*(Add any new regional SVGs here as you create them.)*

---

## Quick start (view locally)

```bash
git clone https://github.com/<your-user>/ChatGPT.git
cd ChatGPT
open index.html            # macOS; or simply double-click the file on Windows
