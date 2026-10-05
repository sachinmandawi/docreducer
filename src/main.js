import './style.css';
import { formatBytes, loadImage, compressToTargetKB } from './compressor.js';
import { convertFormat } from './converter.js';
import { initAdSense, renderAd } from './ads-config.js';
import { LEGAL_PAGES } from './legal-content.js';
import {
  compressPdfToTargetKB,
  convertPdfToImages,
  downloadPagesAsZip,
  generateSamplePdfFile
} from './pdf-engine.js';
import JSZip from 'jszip';

// Compressor State Variables
let currentFile = null;
let currentImage = null;
let originalDataUrl = null;
let currentRotation = 0;
let currentResult = null;
let isCompressing = false;
let debounceTimer = null;
let batchQueue = [];

// Dedicated Converter State Variables
let convFile = null;
let convImage = null;
let convDataUrl = null;
let convRotation = 0;
let convFormat = 'image/webp';
let convQuality = 0.92;
let convPdfLayout = 'fit';
let convResult = null;
let isConverting = false;
let convDebounceTimer = null;
let convBatchQueue = [];

// PDF Compressor State Variables
let currentPdfFile = null;
let currentPdfResult = null;
let isCompressingPdf = false;
let pdfDebounceTimer = null;

// PDF to Image State Variables
let currentPdfImgFile = null;
let currentPdfImgPages = [];
let currentPdfImgFormat = 'image/jpeg';
let isExtractingPdf = false;

// DOM References
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const btnBrowse = document.getElementById('btnBrowse');
const btnSamplePhoto = document.getElementById('btnSamplePhoto');

const editorStage = document.getElementById('editorStage');
const thumbMini = document.getElementById('thumbMini');
const displayFileName = document.getElementById('displayFileName');
const displayFileSpecs = document.getElementById('displayFileSpecs');
const btnChangeFile = document.getElementById('btnChangeFile');
const btnRotatePhoto = document.getElementById('btnRotatePhoto');

const presetsGrid = document.getElementById('presetsGrid');
const targetKbInput = document.getElementById('targetKbInput');
const targetKbSlider = document.getElementById('targetKbSlider');
const targetStatusBadge = document.getElementById('targetStatusBadge');
const examPresetSelect = document.getElementById('examPresetSelect');

const btnAdvancedToggle = document.getElementById('btnAdvancedToggle');
const advancedSettingsBody = document.getElementById('advancedSettingsBody');
const advArrow = document.getElementById('advArrow');
const formatSelect = document.getElementById('formatSelect');
const maxWidthInput = document.getElementById('maxWidthInput');

const statOriginalSize = document.getElementById('statOriginalSize');
const statCompressedSize = document.getElementById('statCompressedSize');
const statSavedPercent = document.getElementById('statSavedPercent');

const imgPreviewOriginal = document.getElementById('imgPreviewOriginal');
const imgPreviewCompressed = document.getElementById('imgPreviewCompressed');

const btnDownload = document.getElementById('btnDownload');
const btnDownloadText = document.getElementById('btnDownloadText');
const btnCopyImage = document.getElementById('btnCopyImage');
const btnResetTool = document.getElementById('btnResetTool');

const batchQueueContainer = document.getElementById('batchQueueContainer');
const batchCount = document.getElementById('batchCount');
const batchList = document.getElementById('batchList');
const btnDownloadAllZip = document.getElementById('btnDownloadAllZip');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIconSun = document.getElementById('themeIconSun');
const themeIconMoon = document.getElementById('themeIconMoon');

const closeStickyAd = document.getElementById('closeStickyAd');
const stickyMobileAd = document.getElementById('stickyMobileAd');

// Modal & Cookie Banner DOM
const legalModal = document.getElementById('legalModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const cookieConsentBanner = document.getElementById('cookieConsentBanner');
const btnAcceptCookies = document.getElementById('btnAcceptCookies');
const btnDeclineCookies = document.getElementById('btnDeclineCookies');

// Tool Switcher DOM
const tabSwitchCompressor = document.getElementById('tabSwitchCompressor');
const tabSwitchConverter = document.getElementById('tabSwitchConverter');
const viewCompressor = document.getElementById('viewCompressor');
const viewConverter = document.getElementById('viewConverter');

// Standalone Converter DOM
const converterDropZone = document.getElementById('converterDropZone');
const converterFileInput = document.getElementById('converterFileInput');
const btnConverterBrowse = document.getElementById('btnConverterBrowse');
const btnSampleConverter = document.getElementById('btnSampleConverter');

const converterEditorStage = document.getElementById('converterEditorStage');
const converterThumbMini = document.getElementById('converterThumbMini');
const converterDisplayFileName = document.getElementById('converterDisplayFileName');
const converterDisplayFileSpecs = document.getElementById('converterDisplayFileSpecs');
const btnConverterChangeFile = document.getElementById('btnConverterChangeFile');
const btnConverterRotate = document.getElementById('btnConverterRotate');

const converterSelectedBadge = document.getElementById('converterSelectedBadge');
const converterFormatsGrid = document.getElementById('converterFormatsGrid');
const converterQualityBox = document.getElementById('converterQualityBox');
const converterQualitySlider = document.getElementById('converterQualitySlider');
const converterQualityBadge = document.getElementById('converterQualityBadge');
const converterPdfBox = document.getElementById('converterPdfBox');

const statConverterOrigFmt = document.getElementById('statConverterOrigFmt');
const statConverterOrigSize = document.getElementById('statConverterOrigSize');
const statConverterNewSize = document.getElementById('statConverterNewSize');
const statConverterDelta = document.getElementById('statConverterDelta');

const converterPreviewArea = document.getElementById('converterPreviewArea');
const converterImgPreviewWrap = document.getElementById('converterImgPreviewWrap');
const imgPreviewConverted = document.getElementById('imgPreviewConverted');
const converterPdfPreviewCard = document.getElementById('converterPdfPreviewCard');
const pdfPreviewTitle = document.getElementById('pdfPreviewTitle');
const pdfPreviewSub = document.getElementById('pdfPreviewSub');

const btnDownloadConverted = document.getElementById('btnDownloadConverted');
const btnDownloadConvertedText = document.getElementById('btnDownloadConvertedText');
const btnConverterCopy = document.getElementById('btnConverterCopy');
const btnConverterReset = document.getElementById('btnConverterReset');

const converterBatchQueue = document.getElementById('converterBatchQueue');
const converterBatchCount = document.getElementById('converterBatchCount');
const converterBatchList = document.getElementById('converterBatchList');
const btnConverterDownloadZip = document.getElementById('btnConverterDownloadZip');

// PDF Format Card DOM
const cardPdfFmtWebp = document.getElementById('cardPdfFmtWebp');

// PDF Compressor DOM
const pdfCompressFileInput = document.getElementById('pdfCompressFileInput');
const btnSamplePdfCompress = document.getElementById('btnSamplePdfCompress');

const pdfCompressEditorStage = document.getElementById('pdfCompressEditorStage');
const pdfDisplayFileName = document.getElementById('pdfDisplayFileName');
const pdfDisplayFileSpecs = document.getElementById('pdfDisplayFileSpecs');
const btnPdfChangeFile = document.getElementById('btnPdfChangeFile');

const pdfPresetsGrid = document.getElementById('pdfPresetsGrid');
const pdfTargetKbInput = document.getElementById('pdfTargetKbInput');
const pdfTargetKbSlider = document.getElementById('pdfTargetKbSlider');
const pdfTargetStatusBadge = document.getElementById('pdfTargetStatusBadge');

const statPdfOriginalSize = document.getElementById('statPdfOriginalSize');
const statPdfCompressedSize = document.getElementById('statPdfCompressedSize');
const statPdfSavedPercent = document.getElementById('statPdfSavedPercent');
const statPdfPagesCount = document.getElementById('statPdfPagesCount');

const pdfCompressProgressWrap = document.getElementById('pdfCompressProgressWrap');
const pdfCompressProgressText = document.getElementById('pdfCompressProgressText');
const pdfCompressProgressBarFill = document.getElementById('pdfCompressProgressBarFill');

const btnDownloadPdf = document.getElementById('btnDownloadPdf');
const btnDownloadPdfText = document.getElementById('btnDownloadPdfText');
const btnPdfReset = document.getElementById('btnPdfReset');

// PDF to Image DOM
const pdfToImageFileInput = document.getElementById('pdfToImageFileInput');
const btnSamplePdfToImage = document.getElementById('btnSamplePdfToImage');

const pdfToImageEditorStage = document.getElementById('pdfToImageEditorStage');
const pdfImgDisplayFileName = document.getElementById('pdfImgDisplayFileName');
const pdfImgDisplayFileSpecs = document.getElementById('pdfImgDisplayFileSpecs');
const btnPdfImgChangeFile = document.getElementById('btnPdfImgChangeFile');

const cardPdfFmtJpg = document.getElementById('cardPdfFmtJpg');
const cardPdfFmtPng = document.getElementById('cardPdfFmtPng');
const pdfImgSelectedBadge = document.getElementById('pdfImgSelectedBadge');

const pdfImgExtractedCount = document.getElementById('pdfImgExtractedCount');
const btnPdfImgDownloadZip = document.getElementById('btnPdfImgDownloadZip');
const pdfPagesGrid = document.getElementById('pdfPagesGrid');
const btnPdfImgReset = document.getElementById('btnPdfImgReset');

/**
 * Initialize App
 */
function initApp() {
  // Theme
  const savedTheme = localStorage.getItem('mb_theme') || 'light';
  applyTheme(savedTheme);

  // Cookie Consent check with Google Consent Mode v2
  const cookieChoice = localStorage.getItem('mb_cookie_consent');
  if (cookieChoice === 'accepted') {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
  } else if (!cookieChoice) {
    setTimeout(() => {
      cookieConsentBanner.classList.add('show');
    }, 800);
  }

  // Ads
  initAdSense();
  renderAd('adTopSlot', 'TOP_LEADERBOARD', 'horizontal', 'Header 728x90');
  renderAd('adMidSlot', 'MID_DOWNLOAD', 'rectangle', 'High-CTR In-Content');
  renderAd('adArticleSlot', 'ARTICLE_NATIVE', 'rectangle', 'In-Article Native Ad');
  renderAd('adStickySlot', 'STICKY_FOOTER', 'horizontal', 'Sticky Mobile 320x50');

  if (window.innerWidth <= 768 && !sessionStorage.getItem('sticky_ad_dismissed')) {
    stickyMobileAd.classList.add('show');
  }

  // Event Listeners
  setupEventListeners();
  setupToolSwitcher();
  setupConverterTool();
  setupPdfCompressTool();
  setupPdfToImageTool();
  setupFaqAccordion();
  setupLegalModalHandlers();
  setupCustomDropdowns();

  // Initialize all range slider track fills
  initAllRangeSliders();

  // Check URL hash for direct links (e.g. #privacy, #terms, #about, #contact)
  checkUrlHash();
  window.addEventListener('hashchange', checkUrlHash);
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });

  if (closeStickyAd) {
    closeStickyAd.addEventListener('click', () => {
      stickyMobileAd.classList.remove('show');
      stickyMobileAd.style.setProperty('display', 'none', 'important');
      sessionStorage.setItem('sticky_ad_dismissed', 'true');
    });
  }

  // Browse & Dropzone
  btnBrowse.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  });

  // Paste Event on Window (Ctrl+V)
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          if (viewConverter && viewConverter.style.display !== 'none') {
            handleConverterFilesSelected([file]);
          } else {
            handleFilesSelected([file]);
          }
          break;
        }
      }
    }
  });

  // Sample Photo Generator Button
  btnSamplePhoto.addEventListener('click', (e) => {
    e.stopPropagation();
    loadSamplePhoto();
  });

  // Change Image & Reset
  btnChangeFile.addEventListener('click', () => {
    fileInput.click();
  });

  btnResetTool.addEventListener('click', () => {
    resetTool();
  });

  // Rotate Button
  if (btnRotatePhoto) {
    btnRotatePhoto.addEventListener('click', () => {
      currentRotation = (currentRotation + 90) % 360;
      triggerCompression();
    });
  }

  // Presets Grid
  presetsGrid.addEventListener('click', (e) => {
    const chip = e.target.closest('.preset-chip');
    if (!chip) return;
    
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const kb = parseInt(chip.getAttribute('data-kb'), 10);
    setTargetKB(kb);
  });

  // Custom Input & Slider Sync
  targetKbInput.addEventListener('input', () => {
    let val = parseInt(targetKbInput.value, 10);
    if (isNaN(val) || val < 5) val = 5;
    if (val > 10000) val = 10000;
    targetKbSlider.value = Math.min(val, 1000);
    updateSliderTrack(val);
    highlightActivePreset(val);
    if (targetStatusBadge) targetStatusBadge.textContent = `Target: ${val} KB`;
    debouncedTriggerCompression();
  });

  targetKbSlider.addEventListener('input', () => {
    const val = parseInt(targetKbSlider.value, 10);
    targetKbInput.value = val;
    updateSliderTrack(val);
    highlightActivePreset(val);
    if (targetStatusBadge) targetStatusBadge.textContent = `Target: ${val} KB`;
    debouncedTriggerCompression();
  });

  // Exam Presets Select
  examPresetSelect.addEventListener('change', () => {
    const val = parseInt(examPresetSelect.value, 10);
    if (!isNaN(val)) {
      setTargetKB(val);
    }
  });

  // Advanced Accordion Toggle
  btnAdvancedToggle.addEventListener('click', () => {
    const isOpen = advancedSettingsBody.classList.contains('open');
    if (isOpen) {
      advancedSettingsBody.classList.remove('open');
      advArrow.innerHTML = '&darr;';
    } else {
      advancedSettingsBody.classList.add('open');
      advArrow.innerHTML = '&uarr;';
    }
  });

  formatSelect.addEventListener('change', () => {
    debouncedTriggerCompression();
  });

  maxWidthInput.addEventListener('input', () => {
    debouncedTriggerCompression();
  });

  // Download Main Image
  btnDownload.addEventListener('click', () => {
    if (!currentResult || !currentResult.blob) return;
    downloadBlob(currentResult.blob, getOutputFileName());
  });

  // Copy to Clipboard
  btnCopyImage.addEventListener('click', async () => {
    if (!currentResult || !currentResult.blob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const pngBlob = await convertBlobToPng(currentResult.blob);
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob })
        ]);
        showToast('Image copied to clipboard!');
      } else {
        showToast('Clipboard not supported in this browser');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not copy image');
    }
  });

  // Batch Download as ZIP
  btnDownloadAllZip.addEventListener('click', () => {
    downloadBatchZip();
  });

  // Cookie Choices with Google Consent Mode v2
  btnAcceptCookies.addEventListener('click', () => {
    localStorage.setItem('mb_cookie_consent', 'accepted');
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
    cookieConsentBanner.classList.remove('show');
    showToast('Cookie preferences updated');
  });

  btnDeclineCookies.addEventListener('click', () => {
    localStorage.setItem('mb_cookie_consent', 'declined');
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
      });
    }
    cookieConsentBanner.classList.remove('show');
    showToast('Only essential cookies will be used');
  });
}

/**
 * Handle Single or Multiple Selected Files
 */
async function handleFilesSelected(files) {
  if (!files || files.length === 0) return;

  // Unified dropzone: If user dropped or selected a PDF into Compress, route directly to PDF Compress
  const firstFile = files[0];
  if (firstFile && (firstFile.type === 'application/pdf' || /\.pdf$/i.test(firstFile.name))) {
    handlePdfCompressFile(firstFile);
    return;
  }

  const isImageFile = (f) => {
    if (f && f.type && f.type.startsWith('image/')) return true;
    return /\.(jpe?g|png|webp|bmp|gif|tiff|svg|avif|heic)$/i.test((f && f.name) || '');
  };
  const imageFiles = files.filter(isImageFile);
  if (imageFiles.length === 0) {
    alert('Please select valid image or PDF files.');
    return;
  }

  const primaryFile = imageFiles[0];
  try {
    const { img, dataUrl } = await loadImage(primaryFile);
    currentFile = primaryFile;
    currentImage = img;
    originalDataUrl = dataUrl;
    currentRotation = 0;

    displayFileName.textContent = currentFile.name;
    displayFileSpecs.textContent = `${formatBytes(currentFile.size)} \u2022 ${img.naturalWidth} \u00d7 ${img.naturalHeight} px`;
    thumbMini.src = dataUrl;
    imgPreviewOriginal.src = dataUrl;

    dropZone.style.display = 'none';
    if (pdfCompressEditorStage) {
      pdfCompressEditorStage.style.display = 'none';
      pdfCompressEditorStage.classList.remove('active');
    }
    editorStage.style.display = 'block';
    editorStage.classList.add('active');

    await triggerCompression();

    if (imageFiles.length > 1) {
      setupBatchQueue(imageFiles);
    } else {
      batchQueueContainer.classList.remove('active');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to load image: ' + err.message);
  }
}

/**
 * Trigger Real-time Compression
 */
async function triggerCompression() {
  if (!currentImage || !currentFile || isCompressing) return;
  isCompressing = true;

  btnDownloadText.textContent = 'Optimizing Image...';
  btnDownload.style.opacity = '0.7';

  const target = parseInt(targetKbInput.value, 10) || 50;
  targetStatusBadge.textContent = `Target: ${target} KB`;

  const format = formatSelect.value;
  const maxWidth = parseInt(maxWidthInput.value, 10) || null;

  try {
    const result = await compressToTargetKB(currentImage, currentFile, {
      targetKB: target,
      format: format,
      maxWidth: maxWidth,
      rotation: currentRotation
    });

    currentResult = result;

    statOriginalSize.textContent = formatBytes(result.originalSize);
    statCompressedSize.textContent = formatBytes(result.compressedSize);
    statSavedPercent.textContent = `-${result.savedPercent}%`;

    imgPreviewCompressed.src = result.url;
    btnDownloadText.textContent = `Download Compressed Image (${formatBytes(result.compressedSize)})`;
    btnDownload.style.opacity = '1';

  } catch (err) {
    console.error('Compression error:', err);
    btnDownloadText.textContent = 'Error during compression';
  } finally {
    isCompressing = false;
  }
}

function debouncedTriggerCompression() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    triggerCompression();
  }, 140);
}

/**
 * Dynamic Range Slider Track Progress
 */
function updateSliderProgress(slider, valOverride = null) {
  if (!slider) return;
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const rawVal = valOverride !== null ? parseFloat(valOverride) : parseFloat(slider.value);
  const val = isNaN(rawVal) ? min : rawVal;
  const clamped = Math.max(min, Math.min(val, max));
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;
  slider.style.setProperty('--slider-pct', `${pct}%`);
}

function updateSliderTrack(val) {
  updateSliderProgress(targetKbSlider, val);
}

function updateQualitySliderTrack(val) {
  updateSliderProgress(converterQualitySlider, val);
}

function initAllRangeSliders() {
  document.querySelectorAll('.range-slider').forEach(slider => {
    const handler = () => updateSliderProgress(slider);
    slider.addEventListener('input', handler);
    slider.addEventListener('change', handler);
    updateSliderProgress(slider);
  });
}

function setTargetKB(kb) {
  targetKbInput.value = kb;
  targetKbSlider.value = Math.min(kb, 1000);
  updateSliderTrack(kb);
  highlightActivePreset(kb);
  if (targetStatusBadge) targetStatusBadge.textContent = `Target: ${kb} KB`;
  triggerCompression();
}

function highlightActivePreset(kb) {
  document.querySelectorAll('.preset-chip').forEach(chip => {
    const chipKb = parseInt(chip.getAttribute('data-kb'), 10);
    if (chipKb === kb) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function resetTool() {
  currentFile = null;
  currentImage = null;
  currentResult = null;
  currentRotation = 0;
  fileInput.value = '';
  dropZone.style.display = 'block';
  editorStage.style.display = 'none';
  editorStage.classList.remove('active');
  if (pdfCompressEditorStage) {
    pdfCompressEditorStage.style.display = 'none';
    pdfCompressEditorStage.classList.remove('active');
  }
  batchQueueContainer.classList.remove('active');
}

/**
 * Robust Sample Photo Loader
 * Supports GitHub Pages subpaths, local Vite, and in-memory canvas fallback
 */
async function fetchSamplePhotoFile() {
  const possibleUrls = [
    new URL('sample-photo.jpg', window.location.href).href,
    './sample-photo.jpg',
    'sample-photo.jpg',
    '/docreducer/sample-photo.jpg',
    '/sahikagaz/sample-photo.jpg',
    '/sample-photo.jpg'
  ];

  for (const url of possibleUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 1000) {
          return new File([blob], 'sample-image.jpg', { type: 'image/jpeg' });
        }
      }
    } catch (e) {
      // Continue to next URL candidate
    }
  }

  // Resilient Fallback: Generate a crisp high-res 1920x1280 sample image on canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 1920, 1280);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(0.5, '#7c3aed');
  grad.addColorStop(1, '#06b6d4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1280);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc((i * 97) % 1920, (i * 131) % 1280, (i * 19) % 160 + 20, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(460, 320, 1000, 640, 32);
  } else {
    ctx.rect(460, 320, 1000, 640);
  }
  ctx.fill();

  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DocReducer Sample Photo', 960, 560);

  ctx.fillStyle = '#6b7280';
  ctx.font = '500 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('High-Resolution Test Document (1920 \u00d7 1280)', 960, 630);
  ctx.fillText('Ready for instant MB to KB compression', 960, 680);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'docreducer-sample-document.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Load Real Sample Photo
 */
async function loadSamplePhoto() {
  const originalText = btnSamplePhoto.textContent;
  btnSamplePhoto.textContent = 'Loading sample photo...';
  btnSamplePhoto.disabled = true;

  try {
    const sampleFile = await fetchSamplePhotoFile();
    await handleFilesSelected([sampleFile]);
  } catch (err) {
    console.error('Failed to load sample image:', err);
    alert('Failed to load sample photo. Please upload an image from your device.');
  } finally {
    btnSamplePhoto.textContent = originalText;
    btnSamplePhoto.disabled = false;
  }
}

/**
 * Batch Queue Manager
 */
async function setupBatchQueue(files) {
  batchQueue = [];
  batchList.innerHTML = '';
  batchCount.textContent = files.length;
  batchQueueContainer.classList.add('active');

  const target = parseInt(targetKbInput.value, 10) || 50;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const itemEl = document.createElement('div');
    itemEl.className = 'batch-item';
    itemEl.id = `batch-item-${i}`;
    itemEl.innerHTML = `
      <span><strong>${file.name}</strong> (${formatBytes(file.size)})</span>
      <span class="batch-item-status" style="color:var(--text-muted);">Compressing...</span>
    `;
    batchList.appendChild(itemEl);

    try {
      const { img } = await loadImage(file);
      const res = await compressToTargetKB(img, file, { targetKB: target });
      batchQueue.push({ file, result: res });
      
      const statusEl = itemEl.querySelector('.batch-item-status');
      statusEl.style.color = 'var(--accent-success)';
      statusEl.textContent = `\u2713 ${formatBytes(res.compressedSize)} (-${res.savedPercent}%)`;
    } catch (e) {
      console.error(e);
      const statusEl = itemEl.querySelector('.batch-item-status');
      statusEl.style.color = '#ef4444';
      statusEl.textContent = 'Failed';
    }
  }
}

async function downloadBatchZip() {
  if (batchQueue.length === 0) return;
  const zip = new JSZip();
  const folder = zip.folder('compressed_images');

  batchQueue.forEach((item) => {
    if (item.result && item.result.blob) {
      const ext = item.result.mimeType === 'image/png' ? 'png' : (item.result.mimeType === 'image/webp' ? 'webp' : 'jpg');
      const baseName = item.file.name.replace(/\.[^/.]+$/, '');
      folder.file(`${baseName}_${formatBytes(item.result.compressedSize).replace(' ', '')}.${ext}`, item.result.blob);
    }
  });

  btnDownloadAllZip.textContent = 'Generating ZIP...';
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `compressed_images_${Date.now()}.zip`);
  btnDownloadAllZip.textContent = 'Download All as ZIP (.zip)';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function getOutputFileName() {
  if (!currentFile || !currentResult) return 'compressed_image.jpg';
  const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
  const target = targetKbInput.value || '50';
  const ext = currentResult.mimeType === 'image/png' ? 'png' : (currentResult.mimeType === 'image/webp' ? 'webp' : 'jpg');
  return `${baseName}_${target}kb.${ext}`;
}

function convertBlobToPng(blob) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(resolve, 'image/png');
    };
    img.src = URL.createObjectURL(blob);
  });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '80px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'rgba(15, 23, 42, 0.9)';
  toast.style.color = '#ffffff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '9999px';
  toast.style.fontSize = '0.9rem';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mb_theme', theme);
  if (theme === 'dark') {
    themeIconSun.style.display = 'none';
    themeIconMoon.style.display = 'block';
  } else {
    themeIconSun.style.display = 'block';
    themeIconMoon.style.display = 'none';
  }
}

function setupFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
    });
  });
}

/**
 * Setup Legal & Information Modal Handlers
 */
function setupLegalModalHandlers() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.legal-nav-btn') || e.target.closest('.legal-link-trigger');
    if (trigger) {
      e.preventDefault();
      const targetPage = trigger.getAttribute('data-target');
      if (targetPage && LEGAL_PAGES[targetPage]) {
        openLegalModal(targetPage);
      }
    }
  });

  modalCloseBtn.addEventListener('click', closeLegalModal);
  legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) {
      closeLegalModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal.classList.contains('open')) {
      closeLegalModal();
    }
  });
}

function openLegalModal(pageKey) {
  const page = LEGAL_PAGES[pageKey];
  if (!page) return;

  modalTitle.textContent = page.title;
  modalBody.innerHTML = page.content;
  legalModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // If opening Contact page, attach direct copy email handler
  if (pageKey === 'contact') {
    const btnCopyEmail = document.getElementById('btnCopyEmailDirect');
    if (btnCopyEmail) {
      btnCopyEmail.addEventListener('click', () => {
        navigator.clipboard.writeText('sachinmandawi@gmail.com').then(() => {
          btnCopyEmail.textContent = '✓ Copied!';
          showToast('Email copied: sachinmandawi@gmail.com');
          setTimeout(() => {
            btnCopyEmail.textContent = '📋 Copy Email';
          }, 2000);
        }).catch(() => {
          showToast('sachinmandawi@gmail.com');
        });
      });
    }
  }
}

function closeLegalModal() {
  legalModal.classList.remove('open');
  document.body.style.overflow = '';
}

function checkUrlHash() {
  const hash = window.location.hash.replace('#', '');
  if (['privacy', 'terms', 'about', 'contact', 'disclaimer'].includes(hash)) {
    openLegalModal(hash);
  }
}

/**
 * Setup Custom Floating Dropdown Cards (Sleek UI)
 */
function setupCustomDropdowns() {
  // Exam Preset Custom Dropdown
  const examWrapper = document.getElementById('examDropdownWrapper');
  const examTrigger = document.getElementById('examDropdownTrigger');
  const examMenu = document.getElementById('examDropdownMenu');
  const examLabel = document.getElementById('examDropdownLabel');

  if (examWrapper && examTrigger && examMenu) {
    examTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = examWrapper.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        examWrapper.classList.add('open');
        examTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    examMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.custom-dropdown-item');
      if (!item) return;

      const val = item.getAttribute('data-value');
      const title = item.querySelector('.dropdown-item-title').textContent;
      examLabel.textContent = title;

      examMenu.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      examPresetSelect.value = val;
      if (val) {
        setTargetKB(parseInt(val, 10));
      }

      examWrapper.classList.remove('open');
      examTrigger.setAttribute('aria-expanded', 'false');
    });
  }

  // Format Custom Dropdown
  const formatWrapper = document.getElementById('formatDropdownWrapper');
  const formatTrigger = document.getElementById('formatDropdownTrigger');
  const formatMenu = document.getElementById('formatDropdownMenu');
  const formatLabel = document.getElementById('formatDropdownLabel');

  if (formatWrapper && formatTrigger && formatMenu) {
    formatTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = formatWrapper.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        formatWrapper.classList.add('open');
        formatTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    formatMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.custom-dropdown-item');
      if (!item) return;

      const val = item.getAttribute('data-value');
      const title = item.querySelector('.dropdown-item-title').textContent;
      formatLabel.textContent = title;

      formatMenu.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      formatSelect.value = val;
      debouncedTriggerCompression();

      formatWrapper.classList.remove('open');
      formatTrigger.setAttribute('aria-expanded', 'false');
    });
  }

  // Close when clicking outside
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}

function closeAllDropdowns(exceptElement = null) {
  document.querySelectorAll('.custom-dropdown').forEach(dd => {
    if (dd !== exceptElement) {
      dd.classList.remove('open');
      const trigger = dd.querySelector('.custom-dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Setup Tool Switcher (Compress vs Convert)
 */
function setupToolSwitcher() {
  if (tabSwitchCompressor) {
    tabSwitchCompressor.addEventListener('click', () => switchTool('compressor'));
  }
  if (tabSwitchConverter) {
    tabSwitchConverter.addEventListener('click', () => switchTool('converter'));
  }
}

function switchTool(tool) {
  const heroTitle = document.getElementById('pageHeroTitle');
  const heroSubtitle = document.getElementById('pageHeroSubtitle');

  if (tool === 'converter') {
    if (viewCompressor) viewCompressor.style.display = 'none';
    if (viewConverter) viewConverter.style.display = 'block';

    if (tabSwitchCompressor) {
      tabSwitchCompressor.classList.remove('active');
      tabSwitchCompressor.setAttribute('aria-selected', 'false');
    }
    if (tabSwitchConverter) {
      tabSwitchConverter.classList.add('active');
      tabSwitchConverter.setAttribute('aria-selected', 'true');
    }

    if (heroTitle) {
      heroTitle.innerHTML = 'Convert Image &amp; <span>PDF Formats</span> Online';
    }
    if (heroSubtitle) {
      heroSubtitle.textContent = 'Convert JPG, PNG, WebP & PDF instantly with 100% client-side privacy. Zero server uploads.';
    }

    renderAd('adMidSlotConverter', 'MID_DOWNLOAD', 'rectangle', 'Format Converter Mid-Ad');
    updateSliderProgress(converterQualitySlider);
  } else {
    if (viewConverter) viewConverter.style.display = 'none';
    if (viewCompressor) viewCompressor.style.display = 'block';

    if (tabSwitchConverter) {
      tabSwitchConverter.classList.remove('active');
      tabSwitchConverter.setAttribute('aria-selected', 'false');
    }
    if (tabSwitchCompressor) {
      tabSwitchCompressor.classList.add('active');
      tabSwitchCompressor.setAttribute('aria-selected', 'true');
    }

    if (heroTitle) {
      heroTitle.innerHTML = 'Reduce Image <span>MB to KB</span> Online';
    }
    if (heroSubtitle) {
      heroSubtitle.textContent = 'Compress JPG, PNG & WebP to exact 20KB, 50KB, or 100KB for Govt Forms, SSC, UPSC & Web. Instant & 100% Free.';
    }

    updateSliderProgress(targetKbSlider);
  }
}

/**
 * Setup Standalone Format Converter Tool
 */
function setupConverterTool() {
  if (!converterDropZone || !converterFileInput) return;

  // Browse & Dropzone
  btnConverterBrowse.addEventListener('click', (e) => {
    e.stopPropagation();
    converterFileInput.click();
  });

  converterDropZone.addEventListener('click', () => {
    converterFileInput.click();
  });

  converterFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleConverterFilesSelected(Array.from(e.target.files));
    }
  });

  converterDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    converterDropZone.classList.add('drag-active');
  });

  converterDropZone.addEventListener('dragleave', () => {
    converterDropZone.classList.remove('drag-active');
  });

  converterDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    converterDropZone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleConverterFilesSelected(Array.from(e.dataTransfer.files));
    }
  });

  // Sample Image Button (Cat photo)
  if (btnSampleConverter) {
    btnSampleConverter.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSampleConverter();
    });
  }

  // Change file & reset
  if (btnConverterChangeFile) {
    btnConverterChangeFile.addEventListener('click', () => {
      converterFileInput.click();
    });
  }

  if (btnConverterReset) {
    btnConverterReset.addEventListener('click', resetConverter);
  }

  // Rotate Button
  if (btnConverterRotate) {
    btnConverterRotate.addEventListener('click', () => {
      convRotation = (convRotation + 90) % 360;
      runConversion();
    });
  }

  // Format Card Selection
  const formatCards = document.querySelectorAll('#converterFormatsGrid .format-card');
  formatCards.forEach(card => {
    card.addEventListener('click', () => {
      formatCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');

      convFormat = card.getAttribute('data-format');
      let name = 'WebP';
      if (convFormat === 'image/jpeg') name = 'JPG / JPEG';
      else if (convFormat === 'image/png') name = 'PNG';
      else if (convFormat === 'application/pdf') name = 'PDF Document';

      if (converterSelectedBadge) {
        converterSelectedBadge.textContent = 'Output: ' + name;
      }

      // Show/Hide format options
      if (convFormat === 'application/pdf') {
        if (converterQualityBox) converterQualityBox.style.display = 'none';
        if (converterPdfBox) converterPdfBox.style.display = 'block';
      } else if (convFormat === 'image/png') {
        if (converterQualityBox) converterQualityBox.style.display = 'none';
        if (converterPdfBox) converterPdfBox.style.display = 'none';
      } else {
        if (converterQualityBox) converterQualityBox.style.display = 'block';
        if (converterPdfBox) converterPdfBox.style.display = 'none';
      }

      debouncedRunConversion();
    });
  });

  // Quality Slider
  if (converterQualitySlider) {
    updateSliderProgress(converterQualitySlider);
    converterQualitySlider.addEventListener('input', () => {
      const val = parseInt(converterQualitySlider.value, 10);
      convQuality = val / 100;
      let label = 'High Quality';
      if (val >= 95) label = 'Maximum Quality';
      else if (val <= 70) label = 'Compact Size';
      if (converterQualityBadge) {
        converterQualityBadge.textContent = `${val}% (${label})`;
      }
      updateSliderProgress(converterQualitySlider, val);
      debouncedRunConversion();
    });
  }

  // PDF Layout Choices
  const pdfRadios = document.querySelectorAll('input[name="pdfLayoutChoice"]');
  pdfRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        convPdfLayout = radio.value;
        debouncedRunConversion();
      }
    });
  });

  // Download Converted Button
  if (btnDownloadConverted) {
    btnDownloadConverted.addEventListener('click', () => {
      if (!convResult) return;
      downloadBlob(convResult.blob, getConverterOutputFileName());
    });
  }

  // Copy Image Button
  if (btnConverterCopy) {
    btnConverterCopy.addEventListener('click', async () => {
      if (!convResult) return;
      if (convFormat === 'application/pdf') {
        showToast('PDF copy to clipboard not supported. Please download the file.');
        return;
      }
      try {
        let pngBlob = convResult.blob;
        if (convResult.mimeType !== 'image/png') {
          pngBlob = await convertBlobToPng(convResult.blob);
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob })
        ]);
        showToast('✓ Converted image copied to clipboard!');
      } catch (err) {
        console.error(err);
        showToast('Could not copy image to clipboard.');
      }
    });
  }

  // Batch ZIP Download Button
  if (btnConverterDownloadZip) {
    btnConverterDownloadZip.addEventListener('click', downloadAllConverterZip);
  }
}

/**
 * Handle files selected in Standalone Converter
 */
async function handleConverterFilesSelected(files) {
  if (!files || files.length === 0) return;

  // Unified dropzone: If user dropped or selected a PDF into Converter, route directly to PDF to Image
  const firstFile = files[0];
  if (firstFile && (firstFile.type === 'application/pdf' || /\.pdf$/i.test(firstFile.name))) {
    handlePdfToImageFile(firstFile);
    return;
  }

  const imageFiles = files.filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpe?g|png|webp|bmp|gif|tiff|svg)$/i));
  if (imageFiles.length === 0) {
    alert('Please select valid image or PDF files.');
    return;
  }

  const primaryFile = imageFiles[0];
  try {
    const { img, dataUrl } = await loadImage(primaryFile);
    convFile = primaryFile;
    convImage = img;
    convDataUrl = dataUrl;
    convRotation = 0;

    converterDisplayFileName.textContent = convFile.name;
    const detectedFmt = convFile.type.replace('image/', '').toUpperCase() || 'IMAGE';
    converterDisplayFileSpecs.textContent = `${detectedFmt} \u2022 ${formatBytes(convFile.size)} \u2022 ${img.naturalWidth} \u00d7 ${img.naturalHeight} px`;
    converterThumbMini.src = dataUrl;

    converterDropZone.style.display = 'none';
    if (pdfToImageEditorStage) {
      pdfToImageEditorStage.style.display = 'none';
      pdfToImageEditorStage.classList.remove('active');
    }
    converterEditorStage.style.display = 'block';
    converterEditorStage.classList.add('active');

    await runConversion();

    if (imageFiles.length > 1) {
      setupConverterBatchQueue(imageFiles);
    } else {
      converterBatchQueue.style.display = 'none';
    }
  } catch (err) {
    console.error(err);
    alert('Failed to load image for converter: ' + err.message);
  }
}

/**
 * Load Sample Photo for Converter
 */
async function loadSampleConverter() {
  const originalText = btnSampleConverter.textContent;
  try {
    btnSampleConverter.textContent = 'Loading Sample Image...';
    btnSampleConverter.disabled = true;

    const sampleFile = await fetchSamplePhotoFile();
    await handleConverterFilesSelected([sampleFile]);
  } catch (err) {
    console.error('Failed to load sample image for converter:', err);
    alert('Failed to load sample photo. Please upload an image from your device.');
  } finally {
    btnSampleConverter.textContent = originalText;
    btnSampleConverter.disabled = false;
  }
}

/**
 * Run Format Conversion
 */
async function runConversion() {
  if (!convImage || !convFile || isConverting) return;
  isConverting = true;

  btnDownloadConvertedText.textContent = 'Converting Image...';
  btnDownloadConverted.style.opacity = '0.7';

  try {
    // Apply rotation if needed
    let activeImg = convImage;
    if (convRotation !== 0) {
      const rotCanvas = document.createElement('canvas');
      const rotCtx = rotCanvas.getContext('2d');
      if (convRotation === 90 || convRotation === 270) {
        rotCanvas.width = convImage.naturalHeight;
        rotCanvas.height = convImage.naturalWidth;
      } else {
        rotCanvas.width = convImage.naturalWidth;
        rotCanvas.height = convImage.naturalHeight;
      }
      rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rotCtx.rotate((convRotation * Math.PI) / 180);
      rotCtx.drawImage(convImage, -convImage.naturalWidth / 2, -convImage.naturalHeight / 2);

      const rotatedBlob = await new Promise(r => rotCanvas.toBlob(r, convFile.type || 'image/jpeg'));
      const rotatedData = await loadImage(rotatedBlob);
      activeImg = rotatedData.img;
    }

    const res = await convertFormat(activeImg, convFile, convFormat, {
      quality: convQuality,
      pdfLayout: convPdfLayout
    });

    convResult = res;

    // Update Stats
    const origExt = convFile.name.split('.').pop().toUpperCase() || 'IMG';
    statConverterOrigFmt.textContent = origExt;
    statConverterOrigSize.textContent = formatBytes(convFile.size);
    statConverterNewSize.textContent = formatBytes(res.size);

    const diff = ((res.size - convFile.size) / convFile.size) * 100;
    if (diff < 0) {
      statConverterDelta.textContent = `${diff.toFixed(1)}%`;
      statConverterDelta.style.color = 'var(--accent-success)';
    } else {
      statConverterDelta.textContent = `+${diff.toFixed(1)}%`;
      statConverterDelta.style.color = 'var(--text-secondary)';
    }

    // Update Preview
    if (convFormat === 'application/pdf') {
      converterImgPreviewWrap.style.display = 'none';
      converterPdfPreviewCard.style.display = 'flex';
      pdfPreviewTitle.textContent = getConverterOutputFileName();
      pdfPreviewSub.textContent = `${formatBytes(res.size)} \u2022 PDF Document Ready for Download`;
      btnConverterCopy.style.display = 'none';
    } else {
      converterPdfPreviewCard.style.display = 'none';
      converterImgPreviewWrap.style.display = 'flex';
      imgPreviewConverted.src = res.url;
      btnConverterCopy.style.display = 'inline-flex';
    }

    btnDownloadConvertedText.textContent = `Download Converted ${res.formatName} (${formatBytes(res.size)})`;
    btnDownloadConverted.style.opacity = '1';
  } catch (err) {
    console.error('Format conversion failed:', err);
    btnDownloadConvertedText.textContent = 'Conversion Failed. Try Again';
    btnDownloadConverted.style.opacity = '1';
  } finally {
    isConverting = false;
  }
}

function debouncedRunConversion() {
  clearTimeout(convDebounceTimer);
  convDebounceTimer = setTimeout(() => {
    runConversion();
  }, 200);
}

function getConverterOutputFileName() {
  if (!convFile) return 'converted_document.pdf';
  const baseName = convFile.name.replace(/\.[^/.]+$/, '');
  let ext = 'jpg';
  if (convFormat === 'image/png') ext = 'png';
  else if (convFormat === 'image/webp') ext = 'webp';
  else if (convFormat === 'application/pdf') ext = 'pdf';
  return `${baseName}_converted.${ext}`;
}

async function setupConverterBatchQueue(files) {
  convBatchQueue = [];
  converterBatchList.innerHTML = '';
  converterBatchCount.textContent = files.length;
  converterBatchQueue.style.display = 'block';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const itemEl = document.createElement('div');
    itemEl.className = 'batch-item';
    itemEl.id = `conv-batch-item-${i}`;
    itemEl.innerHTML = `
      <span><strong>${file.name}</strong> (${formatBytes(file.size)})</span>
      <span class="batch-item-status" style="color:var(--text-muted);">Converting...</span>
    `;
    converterBatchList.appendChild(itemEl);

    try {
      const { img } = await loadImage(file);
      const res = await convertFormat(img, file, convFormat, {
        quality: convQuality,
        pdfLayout: convPdfLayout
      });
      convBatchQueue.push({ file, result: res });

      const statusEl = itemEl.querySelector('.batch-item-status');
      statusEl.style.color = 'var(--accent-success)';
      statusEl.textContent = `✓ ${res.formatName} (${formatBytes(res.size)})`;
    } catch (err) {
      const statusEl = itemEl.querySelector('.batch-item-status');
      statusEl.style.color = 'var(--accent-danger)';
      statusEl.textContent = 'Failed';
    }
  }
}

async function downloadAllConverterZip() {
  if (convBatchQueue.length === 0) return;
  const zip = new JSZip();
  const folder = zip.folder('converted_files');

  convBatchQueue.forEach(item => {
    if (item.result && item.result.blob) {
      const baseName = item.file.name.replace(/\.[^/.]+$/, '');
      folder.file(`${baseName}_converted.${item.result.extension}`, item.result.blob);
    }
  });

  btnConverterDownloadZip.textContent = 'Generating ZIP...';
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `converted_files_${Date.now()}.zip`);
  btnConverterDownloadZip.textContent = 'Download All as ZIP (.zip)';
}

function resetConverter() {
  convFile = null;
  convImage = null;
  convDataUrl = null;
  convRotation = 0;
  convResult = null;
  convBatchQueue = [];

  converterFileInput.value = '';
  converterEditorStage.style.display = 'none';
  converterEditorStage.classList.remove('active');
  if (pdfToImageEditorStage) {
    pdfToImageEditorStage.style.display = 'none';
    pdfToImageEditorStage.classList.remove('active');
  }
  converterDropZone.style.display = 'block';
  converterBatchQueue.style.display = 'none';
  converterBatchList.innerHTML = '';
}

/**
 * Setup PDF Compressor Tool (Category 1: Sub-mode PDF)
 */
function setupPdfCompressTool() {
  if (pdfCompressFileInput) {
    pdfCompressFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handlePdfCompressFile(e.target.files[0]);
      }
    });
  }

  // Sample PDF Button
  if (btnSamplePdfCompress) {
    btnSamplePdfCompress.addEventListener('click', async (e) => {
      e.stopPropagation();
      const origText = btnSamplePdfCompress.textContent;
      try {
        btnSamplePdfCompress.textContent = 'Generating sample certificate...';
        btnSamplePdfCompress.disabled = true;
        const samplePdf = await generateSamplePdfFile();
        await handlePdfCompressFile(samplePdf);
      } catch (err) {
        console.error('Failed to generate sample PDF:', err);
        showToast('Failed to generate sample PDF');
      } finally {
        btnSamplePdfCompress.textContent = origText;
        btnSamplePdfCompress.disabled = false;
      }
    });
  }

  // Change PDF Button
  if (btnPdfChangeFile) {
    btnPdfChangeFile.addEventListener('click', () => {
      if (pdfCompressFileInput) pdfCompressFileInput.click();
      else if (fileInput) fileInput.click();
    });
  }

  // Reset Button
  if (btnPdfReset) {
    btnPdfReset.addEventListener('click', resetPdfCompressTool);
  }

  // Presets Grid
  if (pdfPresetsGrid) {
    pdfPresetsGrid.addEventListener('click', (e) => {
      const chip = e.target.closest('.preset-chip');
      if (!chip) return;
      pdfPresetsGrid.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const kb = parseInt(chip.getAttribute('data-kb'), 10);
      setPdfTargetKB(kb);
    });
  }

  // Custom Input & Slider
  if (pdfTargetKbInput && pdfTargetKbSlider) {
    pdfTargetKbInput.addEventListener('input', () => {
      let val = parseInt(pdfTargetKbInput.value, 10);
      if (isNaN(val) || val < 10) val = 10;
      if (val > 10000) val = 10000;
      pdfTargetKbSlider.value = Math.min(val, 1000);
      updateSliderProgress(pdfTargetKbSlider);
      highlightActivePdfPreset(val);
      debouncedRunPdfCompression();
    });

    pdfTargetKbSlider.addEventListener('input', () => {
      const val = parseInt(pdfTargetKbSlider.value, 10);
      pdfTargetKbInput.value = val;
      updateSliderProgress(pdfTargetKbSlider);
      highlightActivePdfPreset(val);
      debouncedRunPdfCompression();
    });
  }

  // Download Button
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      if (!currentPdfResult || !currentPdfResult.blob) return;
      const baseName = currentPdfFile ? currentPdfFile.name.replace(/\.[^/.]+$/, '') : 'document';
      const target = pdfTargetKbInput ? pdfTargetKbInput.value : '100';
      downloadBlob(currentPdfResult.blob, `${baseName}_compressed_${target}kb.pdf`);
    });
  }
}

async function handlePdfCompressFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    alert('Please select a valid PDF file.');
    return;
  }

  currentPdfFile = file;
  if (pdfDisplayFileName) pdfDisplayFileName.textContent = file.name;
  if (pdfDisplayFileSpecs) pdfDisplayFileSpecs.textContent = `${formatBytes(file.size)}`;

  if (dropZone) dropZone.style.display = 'none';
  if (editorStage) {
    editorStage.style.display = 'none';
    editorStage.classList.remove('active');
  }
  if (pdfCompressEditorStage) {
    pdfCompressEditorStage.style.display = 'block';
    pdfCompressEditorStage.classList.add('active');
  }

  const defaultKb = (pdfTargetKbInput && parseInt(pdfTargetKbInput.value, 10)) || 100;
  setPdfTargetKB(defaultKb);
}


function setPdfTargetKB(kb) {
  if (pdfTargetKbInput) pdfTargetKbInput.value = kb;
  if (pdfTargetKbSlider) {
    pdfTargetKbSlider.value = Math.min(kb, 1000);
    updateSliderProgress(pdfTargetKbSlider);
  }
  if (pdfTargetStatusBadge) pdfTargetStatusBadge.textContent = `Target: ${kb} KB`;
  highlightActivePdfPreset(kb);
  debouncedRunPdfCompression();
}

function highlightActivePdfPreset(kb) {
  if (!pdfPresetsGrid) return;
  pdfPresetsGrid.querySelectorAll('.preset-chip').forEach(c => {
    const chipKb = parseInt(c.getAttribute('data-kb'), 10);
    if (chipKb === kb) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
}

function debouncedRunPdfCompression() {
  clearTimeout(pdfDebounceTimer);
  pdfDebounceTimer = setTimeout(() => {
    runPdfCompression();
  }, 220);
}

async function runPdfCompression() {
  if (!currentPdfFile || isCompressingPdf) return;
  isCompressingPdf = true;

  const targetKB = (pdfTargetKbInput && parseInt(pdfTargetKbInput.value, 10)) || 100;
  if (pdfTargetStatusBadge) pdfTargetStatusBadge.textContent = `Target: ${targetKB} KB`;

  if (pdfCompressProgressWrap) pdfCompressProgressWrap.style.display = 'block';
  if (btnDownloadPdf) btnDownloadPdf.style.opacity = '0.6';
  if (btnDownloadPdfText) btnDownloadPdfText.textContent = 'Compressing PDF...';

  try {
    const res = await compressPdfToTargetKB(currentPdfFile, targetKB, (current, total, msg) => {
      const pct = Math.round((current / total) * 100);
      if (pdfCompressProgressText) pdfCompressProgressText.textContent = msg || `Processing page ${current} of ${total}...`;
      if (pdfCompressProgressBarFill) pdfCompressProgressBarFill.style.width = `${pct}%`;
    });

    currentPdfResult = res;

    // Update specs and stats
    if (pdfDisplayFileSpecs) {
      pdfDisplayFileSpecs.textContent = `${res.numPages} Page${res.numPages > 1 ? 's' : ''} \u2022 Original ${formatBytes(res.originalSize)}`;
    }
    if (statPdfOriginalSize) statPdfOriginalSize.textContent = formatBytes(res.originalSize);
    if (statPdfCompressedSize) statPdfCompressedSize.textContent = formatBytes(res.compressedSize);
    if (statPdfSavedPercent) statPdfSavedPercent.textContent = `-${res.savedPercent}%`;
    if (statPdfPagesCount) statPdfPagesCount.textContent = `${res.numPages} Page${res.numPages > 1 ? 's' : ''}`;

    if (btnDownloadPdfText) btnDownloadPdfText.textContent = `Download Compressed PDF (${formatBytes(res.compressedSize)})`;
    if (btnDownloadPdf) btnDownloadPdf.style.opacity = '1';
  } catch (err) {
    console.error('PDF compression failed:', err);
    if (btnDownloadPdfText) btnDownloadPdfText.textContent = 'PDF Compression Failed';
    showToast('PDF Compression failed. Please try a different target.');
  } finally {
    if (pdfCompressProgressWrap) pdfCompressProgressWrap.style.display = 'none';
    isCompressingPdf = false;
  }
}

function resetPdfCompressTool() {
  currentPdfFile = null;
  currentPdfResult = null;
  if (pdfCompressFileInput) pdfCompressFileInput.value = '';
  if (fileInput) fileInput.value = '';
  if (pdfCompressEditorStage) {
    pdfCompressEditorStage.style.display = 'none';
    pdfCompressEditorStage.classList.remove('active');
  }
  if (editorStage) {
    editorStage.style.display = 'none';
    editorStage.classList.remove('active');
  }
  if (dropZone) dropZone.style.display = 'block';
}

/**
 * Setup PDF to Image Converter (Category 2: Sub-mode PDF to Image)
 */
function setupPdfToImageTool() {
  if (pdfToImageFileInput) {
    pdfToImageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handlePdfToImageFile(e.target.files[0]);
      }
    });
  }

  // Sample PDF Button
  if (btnSamplePdfToImage) {
    btnSamplePdfToImage.addEventListener('click', async (e) => {
      e.stopPropagation();
      const origText = btnSamplePdfToImage.textContent;
      try {
        btnSamplePdfToImage.textContent = 'Generating sample certificate...';
        btnSamplePdfToImage.disabled = true;
        const samplePdf = await generateSamplePdfFile();
        await handlePdfToImageFile(samplePdf);
      } catch (err) {
        console.error('Failed to generate sample PDF:', err);
        showToast('Failed to generate sample PDF');
      } finally {
        btnSamplePdfToImage.textContent = origText;
        btnSamplePdfToImage.disabled = false;
      }
    });
  }

  // Change PDF Button
  if (btnPdfImgChangeFile) {
    btnPdfImgChangeFile.addEventListener('click', () => {
      if (pdfToImageFileInput) pdfToImageFileInput.click();
      else if (converterFileInput) converterFileInput.click();
    });
  }

  // Reset Button
  if (btnPdfImgReset) {
    btnPdfImgReset.addEventListener('click', resetPdfToImageTool);
  }

  // Format selection cards (JPG, PNG, WebP)
  const formatCards = [
    { card: cardPdfFmtJpg, fmt: 'image/jpeg', name: 'JPG' },
    { card: cardPdfFmtPng, fmt: 'image/png', name: 'PNG' },
    { card: cardPdfFmtWebp, fmt: 'image/webp', name: 'WebP' }
  ];

  formatCards.forEach(({ card, fmt, name }) => {
    if (!card) return;
    card.addEventListener('click', () => {
      formatCards.forEach(c => {
        if (c.card) {
          c.card.classList.remove('active');
          c.card.setAttribute('aria-checked', 'false');
        }
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
      currentPdfImgFormat = fmt;
      if (pdfImgSelectedBadge) pdfImgSelectedBadge.textContent = `Output: ${name}`;
      if (currentPdfImgFile) {
        runPdfToImageExtraction();
      }
    });
  });

  // Download All as ZIP
  if (btnPdfImgDownloadZip) {
    btnPdfImgDownloadZip.addEventListener('click', async () => {
      if (currentPdfImgPages.length === 0) return;
      const origText = btnPdfImgDownloadZip.textContent;
      try {
        btnPdfImgDownloadZip.textContent = 'Generating ZIP...';
        btnPdfImgDownloadZip.disabled = true;
        const baseName = currentPdfImgFile ? currentPdfImgFile.name.replace(/\.[^/.]+$/, '') : 'document';
        await downloadPagesAsZip(currentPdfImgPages, `${baseName}_extracted_pages.zip`);
      } catch (err) {
        console.error('Failed to create ZIP:', err);
        showToast('Failed to create ZIP file');
      } finally {
        btnPdfImgDownloadZip.textContent = origText;
        btnPdfImgDownloadZip.disabled = false;
      }
    });
  }
}

async function handlePdfToImageFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    alert('Please select a valid PDF file.');
    return;
  }

  currentPdfImgFile = file;
  if (pdfImgDisplayFileName) pdfImgDisplayFileName.textContent = file.name;
  if (pdfImgDisplayFileSpecs) pdfImgDisplayFileSpecs.textContent = `${formatBytes(file.size)}`;

  if (converterDropZone) converterDropZone.style.display = 'none';
  if (converterEditorStage) {
    converterEditorStage.style.display = 'none';
    converterEditorStage.classList.remove('active');
  }
  if (pdfToImageEditorStage) {
    pdfToImageEditorStage.style.display = 'block';
    pdfToImageEditorStage.classList.add('active');
  }

  await runPdfToImageExtraction();
}


async function runPdfToImageExtraction() {
  if (!currentPdfImgFile || isExtractingPdf) return;
  isExtractingPdf = true;

  if (pdfPagesGrid) {
    pdfPagesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-secondary);">
        <div class="pdf-spinner" style="display:inline-block; width:32px; height:32px; border:3px solid var(--border-color); border-top-color:var(--primary-color); border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:12px;"></div>
        <p>Extracting high-resolution pages from PDF...</p>
      </div>
    `;
  }

  try {
    const result = await convertPdfToImages(currentPdfImgFile, currentPdfImgFormat, 0.92);
    currentPdfImgPages = result.pages;

    if (pdfImgDisplayFileSpecs) {
      pdfImgDisplayFileSpecs.textContent = `${result.numPages} Page${result.numPages > 1 ? 's' : ''} \u2022 ${formatBytes(currentPdfImgFile.size)}`;
    }
    if (pdfImgExtractedCount) pdfImgExtractedCount.textContent = result.numPages;

    renderPdfPagesGrid(result.pages);
  } catch (err) {
    console.error('Failed to extract PDF pages:', err);
    if (pdfPagesGrid) {
      pdfPagesGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--accent-danger); padding: 30px;">Extraction failed: ${err.message}</div>`;
    }
  } finally {
    isExtractingPdf = false;
  }
}

function renderPdfPagesGrid(pages) {
  if (!pdfPagesGrid) return;
  pdfPagesGrid.innerHTML = '';

  pages.forEach(page => {
    const card = document.createElement('div');
    card.className = 'pdf-page-card';
    card.innerHTML = `
      <div class="pdf-page-thumb-wrap">
        <img class="pdf-page-thumb" src="${page.dataUrl}" alt="Page ${page.pageNum} Preview" />
        <span class="pdf-page-badge">Page ${page.pageNum}</span>
      </div>
      <div class="pdf-page-meta">
        <span class="pdf-page-info">${page.width} \u00d7 ${page.height} px &bull; ${formatBytes(page.size)}</span>
        <button type="button" class="btn-download-page" data-page="${page.pageNum}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download ${page.formatName}
        </button>
      </div>
    `;

    const btnDownloadPage = card.querySelector('.btn-download-page');
    btnDownloadPage.addEventListener('click', () => {
      downloadBlob(page.blob, page.fileName);
    });

    pdfPagesGrid.appendChild(card);
  });
}

function resetPdfToImageTool() {
  currentPdfImgFile = null;
  currentPdfImgPages = [];
  if (pdfToImageFileInput) pdfToImageFileInput.value = '';
  if (converterFileInput) converterFileInput.value = '';
  if (pdfToImageEditorStage) {
    pdfToImageEditorStage.style.display = 'none';
    pdfToImageEditorStage.classList.remove('active');
  }
  if (converterEditorStage) {
    converterEditorStage.style.display = 'none';
    converterEditorStage.classList.remove('active');
  }
  if (converterDropZone) converterDropZone.style.display = 'block';
  if (pdfPagesGrid) pdfPagesGrid.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', initApp);
