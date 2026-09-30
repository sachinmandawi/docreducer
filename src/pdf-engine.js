/**
 * SahiKagaz - High-Performance Client-Side PDF Engine
 * Handles:
 * 1. PDF Compression (Target 100KB, 200KB, 500KB or custom KB)
 * 2. PDF to Image Conversion (Extract pages as JPG or PNG)
 * 100% In-Browser Privacy - Zero Cloud Uploads
 */

import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

// Configure PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Load a PDF file into a PDF.js Document object
 */
export async function loadPdfDocument(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true
  });
  return await loadingTask.promise;
}

/**
 * Render a single PDF page to a canvas element
 */
export async function renderPdfPageToCanvas(pdfDoc, pageNum, scale = 1.5) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const renderContext = {
    canvasContext: ctx,
    viewport: viewport
  };
  
  await page.render(renderContext).promise;
  return { canvas, width: viewport.width, height: viewport.height };
}

/**
 * Compress PDF to Exact Target KB
 * Re-encodes embedded page imagery using smart binary quality scaling
 */
export async function compressPdfToTargetKB(file, targetKB = 100, onProgress = null) {
  const pdfDoc = await loadPdfDocument(file);
  const numPages = pdfDoc.numPages;
  const targetBytes = targetKB * 1024;
  
  // Overhead allowance for PDF catalog and page objects (~1.5 KB)
  const availableImageBytes = Math.max(15 * 1024, targetBytes - 2048);
  const perPageTargetBytes = Math.floor(availableImageBytes / numPages);
  
  // Decide base render scale based on per-page budget
  let baseScale = 1.5;
  if (perPageTargetBytes < 35 * 1024) {
    baseScale = 1.0;
  } else if (perPageTargetBytes < 65 * 1024) {
    baseScale = 1.25;
  } else if (perPageTargetBytes > 200 * 1024) {
    baseScale = 1.8;
  }
  
  const pageJpegs = [];
  
  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages, `Processing page ${i} of ${numPages}...`);
    
    const { canvas, width, height } = await renderPdfPageToCanvas(pdfDoc, i, baseScale);
    
    // Binary search for optimal JPEG quality to fit within perPageTargetBytes
    let lowQ = 0.15;
    let highQ = 0.95;
    let bestBlob = null;
    let bestDataUrl = null;
    
    for (let iter = 0; iter < 4; iter++) {
      const midQ = (lowQ + highQ) / 2;
      const dataUrl = canvas.toDataURL('image/jpeg', midQ);
      // Rough binary size from base64 string
      const approxBytes = Math.round((dataUrl.length - 23) * 0.75);
      
      if (approxBytes <= perPageTargetBytes) {
        bestDataUrl = dataUrl;
        lowQ = midQ;
      } else {
        highQ = midQ;
      }
    }
    
    if (!bestDataUrl) {
      bestDataUrl = canvas.toDataURL('image/jpeg', 0.2);
    }
    
    pageJpegs.push({
      dataUrl: bestDataUrl,
      width,
      height
    });
  }
  
  if (onProgress) onProgress(numPages, numPages, 'Assembling optimized PDF...');
  
  // Create output PDF with jsPDF
  const firstPage = pageJpegs[0];
  const firstOrientation = firstPage.width > firstPage.height ? 'landscape' : 'portrait';
  const outPdf = new jsPDF({
    orientation: firstOrientation,
    unit: 'pt',
    format: [firstPage.width, firstPage.height],
    compress: true
  });
  
  for (let idx = 0; idx < pageJpegs.length; idx++) {
    const pageItem = pageJpegs[idx];
    if (idx > 0) {
      const orient = pageItem.width > pageItem.height ? 'landscape' : 'portrait';
      outPdf.addPage([pageItem.width, pageItem.height], orient);
    }
    outPdf.addImage(pageItem.dataUrl, 'JPEG', 0, 0, pageItem.width, pageItem.height, undefined, 'FAST');
  }
  
  const compressedBlob = outPdf.output('blob');
  const compressedSize = compressedBlob.size;
  const originalSize = file.size;
  const savedPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
  const outputUrl = URL.createObjectURL(compressedBlob);
  
  return {
    blob: compressedBlob,
    url: outputUrl,
    numPages,
    originalSize,
    compressedSize,
    savedPercent,
    targetKB,
    hitTarget: compressedSize <= targetBytes
  };
}

/**
 * Convert PDF to Images (JPG or PNG for each page)
 */
export async function convertPdfToImages(file, format = 'image/jpeg', quality = 0.92, onProgress = null) {
  const pdfDoc = await loadPdfDocument(file);
  const numPages = pdfDoc.numPages;
  const pages = [];
  
  const scale = 2.0; // High clarity render (approx 150-200 DPI)
  
  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages, `Extracting page ${i} of ${numPages}...`);
    
    const { canvas, width, height } = await renderPdfPageToCanvas(pdfDoc, i, scale);
    
    let mime = 'image/jpeg';
    let ext = 'jpg';
    if (format === 'image/png') {
      mime = 'image/png';
      ext = 'png';
    } else if (format === 'image/webp') {
      mime = 'image/webp';
      ext = 'webp';
    }
    
    const dataUrl = canvas.toDataURL(mime, quality);
    const blob = await new Promise(res => canvas.toBlob(res, mime, quality));
    const url = URL.createObjectURL(blob);
    
    pages.push({
      pageNum: i,
      dataUrl,
      blob,
      url,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      formatName: ext.toUpperCase(),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}_page_${i}.${ext}`
    });
  }
  
  return {
    pages,
    numPages,
    docName: file.name
  };
}

/**
 * Retrieve sample cat photo as JPEG data URL for embedding into sample PDF
 */
async function getCatImageDataUrl() {
  const possibleUrls = [
    new URL('sample-photo.jpg', window.location.href).href,
    './sample-photo.jpg',
    'sample-photo.jpg',
    '/sahikagaz/sample-photo.jpg',
    '/sample-photo.jpg'
  ];

  for (const url of possibleUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 1000) {
          const img = new Image();
          const imgLoadPromise = new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
          });
          const objectUrl = URL.createObjectURL(blob);
          img.src = objectUrl;
          await imgLoadPromise;
          URL.revokeObjectURL(objectUrl);

          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let w = img.naturalWidth || 1200;
          let h = img.naturalHeight || 800;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          return canvas.toDataURL('image/jpeg', 0.88);
        }
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  return null;
}

/**
 * Generate a realistic multi-page sample PDF file in-browser with cat photo
 */
export async function generateSamplePdfFile() {
  const catDataUrl = await getCatImageDataUrl();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: false
  });

  // Page 1: Official Marksheet / Certificate
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 595, 842, 'F');

  // Decorative border
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(3);
  doc.rect(30, 30, 535, 782);
  doc.setLineWidth(1);
  doc.rect(36, 36, 523, 770);

  // Header
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRAL BOARD OF EXAMINATION', 297, 85, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(99, 102, 241);
  doc.text('SENIOR SCHOOL CERTIFICATE EXAMINATION', 297, 110, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.line(60, 125, 535, 125);

  // Candidate Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Roll No: 2026198421', 60, 155);
  doc.text('Candidate Name: RAHUL SHARMA', 60, 175);
  doc.text("Mother's Name: SUNITA SHARMA", 60, 195);
  doc.text("Father's Name: RAJESH SHARMA", 60, 215);
  doc.text('School Code: 84021 - DELHI PUBLIC SCHOOL', 60, 235);

  // Candidate Photograph (Cat Image!)
  if (catDataUrl) {
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1.5);
    doc.roundedRect(420, 138, 95, 105, 4, 4);
    doc.addImage(catDataUrl, 'JPEG', 422, 140, 91, 101);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('PHOTO (CAT)', 467, 252, { align: 'center' });
  }

  // Table Header
  doc.setFillColor(79, 70, 229);
  doc.rect(60, 260, 475, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('SUB CODE', 70, 276);
  doc.text('SUBJECT NAME', 140, 276);
  doc.text('THEORY', 340, 276);
  doc.text('PRACTICAL', 410, 276);
  doc.text('TOTAL', 485, 276);

  // Table Rows
  const subjects = [
    ['301', 'ENGLISH CORE', '078', '020', '098'],
    ['041', 'MATHEMATICS', '074', '020', '094'],
    ['042', 'PHYSICS', '065', '030', '095'],
    ['043', 'CHEMISTRY', '068', '030', '098'],
    ['083', 'COMPUTER SCIENCE', '069', '030', '099']
  ];

  let y = 300;
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  subjects.forEach((s, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(60, y - 14, 475, 20, 'F');
    }
    doc.text(s[0], 75, y);
    doc.text(s[1], 140, y);
    doc.text(s[2], 350, y);
    doc.text(s[3], 425, y);
    doc.text(s[4], 495, y);
    y += 24;
  });

  // Result Badge
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(60, 440, 475, 34, 6, 6, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RESULT: PASS (PERCENTAGE: 96.8%) \u2022 DISTINCTION', 297, 461, { align: 'center' });

  // Embedded Graphic / Cat Photo on Page 1
  if (catDataUrl) {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.rect(78, 490, 439, 210);
    doc.addImage(catDataUrl, 'JPEG', 80, 492, 435, 206);
  } else {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 700;
    sampleCanvas.height = 350;
    const sCtx = sampleCanvas.getContext('2d');
    const grad = sCtx.createLinearGradient(0, 0, 700, 350);
    grad.addColorStop(0, '#4338ca');
    grad.addColorStop(1, '#06b6d4');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 700, 350);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 32px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('OFFICIAL DIGITAL VERIFICATION SEAL', 350, 180);
    const sealDataUrl = sampleCanvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(sealDataUrl, 'JPEG', 80, 500, 435, 180);
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Controller of Examinations', 440, 740, { align: 'center' });
  doc.text('Date of Issue: 24-MAY-2026', 120, 740, { align: 'center' });

  // Page 2: Government Application Verification Page
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 595, 842, 'F');
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(2);
  doc.rect(30, 30, 535, 782);

  doc.setTextColor(30, 27, 75);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT RECRUITMENT PORTAL', 297, 80, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(99, 102, 241);
  doc.text('Application Form Verification & Document Record', 297, 105, { align: 'center' });

  doc.line(60, 120, 535, 120);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Application ID: GOV-2026-9812401', 60, 150);
  doc.text('Post Applied: COMBINED GRADUATE LEVEL (CGL)', 60, 170);
  doc.text('Verification Status: E-KYC VERIFIED', 60, 190);
  doc.text('Category: GENERAL / UNRESERVED', 60, 210);

  // Second Embedded Graphic for Page 2 (Cat Image!)
  if (catDataUrl) {
    doc.setTextColor(30, 27, 75);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTACHED PHOTOGRAPHIC DOCUMENT RECORD', 297, 240, { align: 'center' });

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.rect(78, 253, 439, 314);
    doc.addImage(catDataUrl, 'JPEG', 80, 255, 435, 310);
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated sample test document for SahiKagaz compression and conversion.', 297, 750, { align: 'center' });

  const pdfBlob = doc.output('blob');
  return new File([pdfBlob], 'sample_exam_certificate.pdf', { type: 'application/pdf' });
}

/**
 * Package multiple extracted PDF pages into a single zip file and trigger download
 */
export async function downloadPagesAsZip(pages, zipFileName = 'extracted_pages.zip') {
  if (!pages || pages.length === 0) return;
  const zip = new JSZip();
  const folder = zip.folder('extracted_pages');
  pages.forEach(p => {
    folder.file(p.fileName, p.blob);
  });
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

