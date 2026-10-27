(() => {
  'use strict';

  const viewport = document.getElementById('document');
  const image = document.getElementById('cv-preview');
  const controls = document.querySelector('.zoom-controls');
  const zoomOut = document.getElementById('zoom-out');
  const zoomIn = document.getElementById('zoom-in');
  const zoomFit = document.getElementById('zoom-fit');
  const zoomLevel = document.getElementById('zoom-level');
  const error = document.getElementById('preview-error');
  const scales = [1, 1.25, 1.5, 2, 2.5, 3];
  const fittedSizes = image.sizes;
  let step = 0;

  const renderZoom = () => {
    viewport.style.setProperty('--page-width', `${scales[step] * 100}%`);
    image.sizes = step === 0 ? fittedSizes : `${Math.ceil(image.clientWidth)}px`;
    zoomLevel.value = `${Math.round(scales[step] * 100)}%`;
    zoomOut.disabled = step === 0;
    zoomIn.disabled = step === scales.length - 1;
    if (step === 0) viewport.scrollLeft = 0;
  };

  zoomOut.addEventListener('click', () => {
    step = Math.max(0, step - 1);
    renderZoom();
  });

  zoomIn.addEventListener('click', () => {
    step = Math.min(scales.length - 1, step + 1);
    renderZoom();
  });

  zoomFit.addEventListener('click', () => {
    step = 0;
    renderZoom();
  });

  const showError = () => {
    viewport.hidden = true;
    controls.hidden = true;
    error.hidden = false;
  };

  image.addEventListener('error', showError);
  if (image.complete && image.naturalWidth === 0) {
    showError();
  } else {
    controls.hidden = false;
  }
})();
