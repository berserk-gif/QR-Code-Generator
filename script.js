/* Real-time QR generator using QRious
   Features:
   - Real-time update from single-line or multi-line inputs
   - URL detection: if valid URL, displays "url" mode; else "text"
   - Size selection (radio)
   - Color templates (swatches) and custom color pickers
   - Download PNG (from canvas)
   - Light/Dark theme toggle
*/

(() => {
  // DOM references
  const singleInput = document.getElementById('singleInput');
  const multiInput = document.getElementById('multiInput');
  const swatchesWrap = document.getElementById('swatches');
  const fgPicker = document.getElementById('fgColor');
  const bgPicker = document.getElementById('bgColor');
  const qrWrap = document.getElementById('qrWrap');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const modeLabel = document.getElementById('modeLabel');
  const generatedFrom = document.getElementById('generatedFrom');
  const sizeText = document.getElementById('sizeText');
  const themeSwitch = document.getElementById('themeSwitch');
  const exampleText = document.getElementById('exampleText');

  // Example placeholder and initial content
  const EXAMPLE = 'https://github.com/berserk-gif';
  exampleText.textContent = EXAMPLE;
  singleInput.value = EXAMPLE;
  multiInput.value = '';

  // Templates (foreground, background)
  const templates = [
    { name: 'Classic', fg:'#0b0b0b', bg:'#ffffff' },
    { name: 'Ocean', fg:'#003f8a', bg:'#e6f2ff' },
    { name: 'Mint', fg:'#052b18', bg:'#b6f5d1' },
    { name: 'Sunset', fg:'#3b1f00', bg:'#ffd6a6' },
    { name: 'Neon', fg:'#0a0a0a', bg:'#6ef3c1' },
    { name: 'Midnight', fg:'#ffd66b', bg:'#0a0b1a' }
  ];

  // Keep state
  let state = {
    content: EXAMPLE,
    size: 256,
    fg: templates[0].fg,
    bg: templates[0].bg,
    selectedTemplate: 0
  };

  // create swatches UI
  templates.forEach((t, idx) => {
    const btn = document.createElement('button');
    btn.className = 'swatch';
    btn.type = 'button';
    btn.title = t.name;
    btn.setAttribute('role','listitem');
    btn.setAttribute('aria-label', `Apply template ${t.name}`);
    btn.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        <rect width="36" height="36" rx="8" fill="${t.bg}"></rect>
        <rect x="6" y="6" width="24" height="24" rx="6" fill="${t.fg}"></rect>
      </svg>
    `.trim();
    btn.addEventListener('click', () => {
      applyTemplate(idx);
    });
    swatchesWrap.appendChild(btn);
  });

  // Initialize color pickers with default
  fgPicker.value = state.fg;
  bgPicker.value = state.bg;

  // QRious instance (canvas-based)
  const qr = new QRious({
    element: document.createElement('canvas'),
    size: state.size,
    value: state.content,
    background: state.bg,
    foreground: state.fg,
    level: 'H'
  });

  // Put canvas into DOM
  qrWrap.innerHTML = '';
  qrWrap.appendChild(qr.element);

  // Utility: URL validation (simple)
  function isValidUrl(s) {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  }

  // Apply a template by index
  function applyTemplate(index) {
    state.selectedTemplate = index;
    state.fg = templates[index].fg;
    state.bg = templates[index].bg;
    // update pickers to match
    fgPicker.value = state.fg;
    bgPicker.value = state.bg;
    updateActiveSwatch();
    renderQR();
  }

  function updateActiveSwatch() {
    const children = swatchesWrap.children;
    for (let i=0;i<children.length;i++){
      children[i].classList.toggle('active', i === state.selectedTemplate);
    }
  }

  // Render QR with current state
  function renderQR() {
    const content = state.content;
    const isUrl = isValidUrl(content);

    modeLabel.textContent = `Mode: ${isUrl ? 'url' : 'text'}`;
    generatedFrom.textContent = isUrl ? 'url' : 'text';
    sizeText.textContent = state.size;

    qr.set({
      size: state.size,
      value: content,
      foreground: state.fg,
      background: state.bg,
      level: 'H'
    });
  }

  // Event handlers: inputs update state and rerender instantly
  function syncFromInputs() {
    const single = (singleInput.value || '').trim();
    const multi = (multiInput.value || '').trim();
    state.content = single !== '' ? single : (multi !== '' ? multi : EXAMPLE);
    renderQR();
  }

  // size radios
  document.querySelectorAll('input[name="size"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.size = parseInt(e.target.value, 10);
      renderQR();
    });
  });

  // color pickers
  fgPicker.addEventListener('input', (e) => {
    state.fg = e.target.value;
    state.selectedTemplate = -1;
    updateActiveSwatch();
    renderQR();
  });
  bgPicker.addEventListener('input', (e) => {
    state.bg = e.target.value;
    state.selectedTemplate = -1;
    updateActiveSwatch();
    renderQR();
  });

  // input listeners (real-time)
  singleInput.addEventListener('input', syncFromInputs);
  multiInput.addEventListener('input', syncFromInputs);

  // Download PNG
  downloadBtn.addEventListener('click', () => {
    renderQR();
    const canvas = qr.element;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Reset to example
  resetBtn.addEventListener('click', () => {
    singleInput.value = EXAMPLE;
    multiInput.value = '';
    state.content = EXAMPLE;
    state.size = 256;
    document.querySelector('input[name="size"][value="256"]').checked = true;
    applyTemplate(0);
    renderQR();
    singleInput.focus();
  });

  // Theme toggle
  themeSwitch.addEventListener('change', (e) => {
    if (e.target.checked) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  });

  // initial setup
  applyTemplate(0);
  renderQR();
  updateActiveSwatch();

})();
