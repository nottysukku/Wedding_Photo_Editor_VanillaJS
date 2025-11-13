// Initialize Swiper
const swiper = new Swiper('.swiper', {
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  loop: false,
  allowTouchMove: true,
  on: {
    slideChange: function() {
      deselectAllText();
    }
  }
});

// State management
let selectedTextElement = null;
let textCounter = 0;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let activePointerId = null; // supports mouse and touch via Pointer Events

// Debug function
function debugDrag(message) {
  console.log(`Drag Debug: ${message}`, {
    isDragging,
    selectedTextElement: selectedTextElement ? selectedTextElement.textContent : null,
    offsetX,
    offsetY
  });
}

// DOM elements
const textContentInput = document.getElementById('textContent');
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeInput = document.getElementById('fontSize');
const fontColorInput = document.getElementById('fontColor');
const fontColorHexInput = document.getElementById('fontColorHex');
const addTextBtn = document.getElementById('addTextBtn');
const statusDiv = document.getElementById('status');

// Add text button
addTextBtn.addEventListener('click', () => {
  const activeSlide = document.querySelector('.swiper-slide-active');
  const textOverlay = activeSlide.querySelector('.text-overlay');
  addTextElement(textOverlay, `Text ${++textCounter}`, 50, 50);
});

// Function to add text element
function addTextElement(overlay, text, x, y) {
  const textEl = document.createElement('div');
  textEl.className = 'text-element';
  textEl.textContent = text;
  textEl.style.left = x + 'px';
  textEl.style.top = y + 'px';
  textEl.style.fontSize = '24px';
  textEl.style.fontFamily = 'Arial';
  textEl.style.color = '#ffffff';

  // Pointer-based drag (works for mouse and touch)
  const onPointerDown = (e) => {
    // Left mouse button or any touch/pen
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    selectTextElement(textEl);

    // Disable Swiper interactions during drag
    swiper.allowTouchMove = false;
    swiper.allowSlideNext = false;
    swiper.allowSlidePrev = false;

    // Start dragging
    isDragging = true;
    activePointerId = e.pointerId !== undefined ? e.pointerId : 'mouse';

    const rect = textEl.getBoundingClientRect();
    offsetX = (e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0) - rect.left;
    offsetY = (e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0) - rect.top;

    // Capture pointer so we continue to receive move events
    try {
      if (textEl.setPointerCapture && e.pointerId !== undefined) {
        textEl.setPointerCapture(e.pointerId);
      }
    } catch {}

    // Visual feedback
    textEl.style.cursor = 'grabbing';
    document.body.style.cursor = 'grabbing';
    debugDrag('Pointer down - dragging started');
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

    e.preventDefault();
    e.stopPropagation();

    const activeSlide = document.querySelector('.swiper-slide-active');
    const textOverlay = activeSlide.querySelector('.text-overlay');
    if (!textOverlay) return;
    const overlayRect = textOverlay.getBoundingClientRect();

    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;

    let x = clientX - overlayRect.left - offsetX;
    let y = clientY - overlayRect.top - offsetY;

    const elementWidth = selectedTextElement?.offsetWidth || textEl.offsetWidth || 100;
    const elementHeight = selectedTextElement?.offsetHeight || textEl.offsetHeight || 30;
    const maxX = Math.max(0, overlayRect.width - elementWidth);
    const maxY = Math.max(0, overlayRect.height - elementHeight);
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    textEl.style.left = x + 'px';
    textEl.style.top = y + 'px';
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    // Release pointer capture
    try {
      if (textEl.releasePointerCapture && e.pointerId !== undefined) {
        textEl.releasePointerCapture(e.pointerId);
      }
    } catch {}

    // Re-enable Swiper
    swiper.allowTouchMove = true;
    swiper.allowSlideNext = true;
    swiper.allowSlidePrev = true;

    textEl.style.cursor = 'move';
    document.body.style.cursor = 'default';
    isDragging = false;
    activePointerId = null;
    debugDrag('Pointer up - dragging stopped');
  };

  // Attach pointer listeners
  textEl.addEventListener('pointerdown', onPointerDown);
  textEl.addEventListener('pointermove', onPointerMove);
  textEl.addEventListener('pointerup', onPointerUp);
  textEl.addEventListener('pointercancel', onPointerUp);

  // Double click to edit text
  textEl.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    editTextInline(textEl);
  });

  overlay.appendChild(textEl);
  selectTextElement(textEl);
}

// Select text element
function selectTextElement(textEl) {
  deselectAllText();
  selectedTextElement = textEl;
  textEl.classList.add('selected');
  
  // Update controls
  textContentInput.value = textEl.textContent;
  fontFamilySelect.value = textEl.style.fontFamily.replace(/['"]/g, '');
  fontSizeInput.value = parseInt(textEl.style.fontSize);
  fontColorInput.value = rgbToHex(textEl.style.color);
  fontColorHexInput.value = rgbToHex(textEl.style.color);
  
  // Enable controls
  enableControls();
  statusDiv.textContent = 'Text selected';
}

// Deselect all text
function deselectAllText() {
  document.querySelectorAll('.text-element').forEach(el => {
    el.classList.remove('selected');
  });
  selectedTextElement = null;
  disableControls();
  statusDiv.textContent = 'No text selected';
}

// Enable/disable controls
function enableControls() {
  textContentInput.disabled = false;
  fontFamilySelect.disabled = false;
  fontSizeInput.disabled = false;
  fontColorInput.disabled = false;
  fontColorHexInput.disabled = false;
}

function disableControls() {
  textContentInput.disabled = true;
  fontFamilySelect.disabled = true;
  fontSizeInput.disabled = true;
  fontColorInput.disabled = true;
  fontColorHexInput.disabled = true;
}

// Drag functionality
// Also support legacy mouse events as a fallback (desktop)
document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  // Re-enable Swiper if something went wrong
  swiper.allowTouchMove = true;
  swiper.allowSlideNext = true;
  swiper.allowSlidePrev = true;
  if (selectedTextElement) selectedTextElement.style.cursor = 'move';
  document.body.style.cursor = 'default';
  isDragging = false;
  activePointerId = null;
});

// Click outside to deselect
document.querySelector('.swiper').addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('swiper-slide') || e.target.tagName === 'IMG' || e.target.classList.contains('text-overlay')) {
    deselectAllText();
  }
});

// Inline text editing function
function editTextInline(textEl) {
  const currentText = textEl.textContent;
  const rect = textEl.getBoundingClientRect();
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.style.position = 'absolute';
  input.style.left = textEl.style.left;
  input.style.top = textEl.style.top;
  input.style.fontSize = textEl.style.fontSize;
  input.style.fontFamily = textEl.style.fontFamily;
  input.style.color = textEl.style.color;
  input.style.background = 'rgba(0, 0, 0, 0.8)';
  input.style.border = '2px solid #4CAF50';
  input.style.borderRadius = '4px';
  input.style.padding = '4px 8px';
  input.style.zIndex = '100';
  input.style.outline = 'none';
  
  // Hide original text element
  textEl.style.display = 'none';
  
  // Add input to same parent
  textEl.parentElement.appendChild(input);
  input.focus();
  input.select();
  
  // Handle input completion
  const finishEditing = () => {
    const newText = input.value.trim() || currentText;
    textEl.textContent = newText;
    textEl.style.display = 'block';
    input.remove();
    
    // Update control panel
    if (selectedTextElement === textEl) {
      textContentInput.value = newText;
    }
  };
  
  input.addEventListener('blur', finishEditing);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    }
  });
}

// Text content change
textContentInput.addEventListener('input', (e) => {
  if (selectedTextElement) {
    selectedTextElement.textContent = e.target.value;
  }
});

// Font family change
fontFamilySelect.addEventListener('change', (e) => {
  if (selectedTextElement) {
    selectedTextElement.style.fontFamily = e.target.value;
  }
});

// Font size change
fontSizeInput.addEventListener('input', (e) => {
  if (selectedTextElement) {
    selectedTextElement.style.fontSize = e.target.value + 'px';
  }
});

// Font color change
fontColorInput.addEventListener('input', (e) => {
  if (selectedTextElement) {
    selectedTextElement.style.color = e.target.value;
    fontColorHexInput.value = e.target.value;
  }
});

fontColorHexInput.addEventListener('input', (e) => {
  if (selectedTextElement && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
    selectedTextElement.style.color = e.target.value;
    fontColorInput.value = e.target.value;
  }
});

// Helper function: RGB to Hex
function rgbToHex(rgb) {
  if (rgb.startsWith('#')) return rgb;
  
  const result = rgb.match(/\d+/g);
  if (!result) return '#ffffff';
  
  const r = parseInt(result[0]);
  const g = parseInt(result[1]);
  const b = parseInt(result[2]);
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Initialize with default text on first slide
window.addEventListener('load', () => {
  const firstSlide = document.querySelector('.swiper-slide[data-slide-index="0"]');
  const textOverlay = firstSlide.querySelector('.text-overlay');
  addTextElement(textOverlay, 'Sample Text', 100, 100);
});
