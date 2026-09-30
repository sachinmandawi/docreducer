/**
 * SahiKagaz - Dedicated Image & Document Format Converter Engine
 * Converts images between JPG, PNG, WebP, and PDF (100% Client-Side Canvas & jsPDF)
 */

/**
 * Convert Image to Target Format (JPG, PNG, WebP, PDF)
 * @param {HTMLImageElement} img - Preloaded Image object
 * @param {File} file - Original file
 * @param {string} targetFormat - Target MIME ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
 * @param {Object} options - { quality: number, pdfLayout: 'fit'|'a4' }
 */
export async function convertFormat(img, file, targetFormat = 'image/jpeg', options = {}) {
  const quality = options.quality !== undefined ? options.quality : 0.92;
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Case 1: PDF Document Generation
  if (targetFormat === 'application/pdf') {
    const { jsPDF } = await import('jspdf');
    const isA4 = options.pdfLayout === 'a4';
    let pdf;
    let imgRenderX = 0;
    let imgRenderY = 0;
    let imgRenderW = origWidth;
    let imgRenderH = origHeight;

    if (isA4) {
      // Standard A4 dimensions in pt: 595.28 x 841.89
      const orientation = origWidth > origHeight ? 'landscape' : 'portrait';
      pdf = new jsPDF({
        orientation: orientation,
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28.35; // 10mm margin
      const maxW = pageWidth - (margin * 2);
      const maxH = pageHeight - (margin * 2);

      const ratio = Math.min(maxW / origWidth, maxH / origHeight);
      imgRenderW = origWidth * ratio;
      imgRenderH = origHeight * ratio;
      imgRenderX = margin + (maxW - imgRenderW) / 2;
      imgRenderY = margin + (maxH - imgRenderH) / 2;
    } else {
      const orientation = origWidth > origHeight ? 'landscape' : 'portrait';
      pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [origWidth, origHeight]
      });
    }

    // Draw image onto canvas to get JPEG representation for PDF
    const canvas = document.createElement('canvas');
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, origWidth, origHeight);
    ctx.drawImage(img, 0, 0, origWidth, origHeight);
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);

    pdf.addImage(jpegDataUrl, 'JPEG', imgRenderX, imgRenderY, imgRenderW, imgRenderH);
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      blob: pdfBlob,
      url: pdfUrl,
      mimeType: 'application/pdf',
      extension: 'pdf',
      size: pdfBlob.size,
      width: origWidth,
      height: origHeight,
      formatName: 'PDF Document'
    };
  }

  // Case 2: Raster formats (JPEG, PNG, WebP)
  const canvas = document.createElement('canvas');
  canvas.width = origWidth;
  canvas.height = origHeight;
  const ctx = canvas.getContext('2d', { alpha: targetFormat === 'image/png' });

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, origWidth, origHeight);
  }

  ctx.drawImage(img, 0, 0, origWidth, origHeight);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const outputUrl = URL.createObjectURL(blob);
      let ext = 'jpg';
      let formatName = 'JPEG';
      if (targetFormat === 'image/png') {
        ext = 'png';
        formatName = 'PNG';
      } else if (targetFormat === 'image/webp') {
        ext = 'webp';
        formatName = 'WebP';
      }

      resolve({
        blob,
        url: outputUrl,
        mimeType: targetFormat,
        extension: ext,
        size: blob.size,
        width: origWidth,
        height: origHeight,
        formatName
      });
    }, targetFormat, quality);
  });
}
