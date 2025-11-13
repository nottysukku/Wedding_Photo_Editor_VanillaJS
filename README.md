# Wedding Photo Editor (SwiperJS)

A lightweight web-based photo editor for portrait images using SwiperJS. Supports adding/editing draggable text and images per slide with touch and mouse support, and a strict 9:16 canvas.

## Features

- Swiper carousel with navigation (3 slides by default)
- 9:16 canvas sizing that adapts to screen size
- Add text: draggable, selectable, inline-editable, resizable (via handles)
- Add image: upload, draggable, resizable (via handles)
- Touch-friendly: Pointer Events with pointer capture for smooth drag/resize
- Responsive layout: controls panel and editor stack on small screens

## Getting Started

Open `index.html` directly in a modern browser. No build tools required.

Alternatively, serve via a simple local server:

```bash
# Python 3
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How to Use

1. Navigate slides with the arrows.
2. Add Text: Click "Add Text". A text box appears on the current slide overlay.
   - Drag to reposition (mouse/touch)
   - Double-click to edit
   - Resize using corner handles
3. Add Image: Click "Add Image" and pick a file.
   - Drag to reposition (mouse/touch)
   - Resize using corner handles
4. Use the sidebar to change text content, font family, font size, and color when a text box is selected.

## Notes

- Elements are bounded within the canvas overlay and won’t leave the image area.
- Swiper swipe gestures are disabled while dragging/resizing for precision, and re-enabled on release.
- Tested on latest Chrome/Edge (desktop and mobile). Requires Pointer Events support.

## Next Ideas

- Export slide as an image
- Multi-select and group move
- Undo/redo history
- Snap to guides and alignment tools
