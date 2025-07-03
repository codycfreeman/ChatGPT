# California YPAA Map with Zoom

This repository hosts an HTML page that inlines the California county SVG map and adds zoom & pan capabilities.

## Files

- `usa-ca-optimized-viewbox.svg` – source SVG map.
- `panzoom.min.js` – local copy of the [panzoom](https://github.com/anvaka/panzoom) library.
- `index.html` – standalone page that displays the map with zoom.

## Usage

Open `index.html` in a browser or host it on any web server. It uses the local `panzoom.min.js` to allow zooming and panning so no external network access is required. Embed this page in another site with an `<iframe>` tag if desired.

```
<iframe src="path/to/index.html" width="100%" height="600" style="border:0;"></iframe>
```

The map will not push surrounding elements around when zooming since the SVG is contained within the page and only its internal transform changes.

Links embedded inside the SVG behave differently for desktop and mobile users. On desktop, navigation is cancelled if the map was panned. The script listens for the `panend` event and ignores the first click after a drag. On touch devices, tapping a link pauses panzoom so the destination opens normally even after moving the map.