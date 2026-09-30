/**
 * Google AdSense & Monetization Configuration
 * 
 * Replace 'ADS_ENABLED' with true and add your 'CLIENT_ID' (ca-pub-XXXXXXXXXXXXXXXX)
 * once your AdSense account is approved.
 */

export const ADS_CONFIG = {
  // Set to true once you have your approved Google AdSense client ID
  ADS_ENABLED: false,

  // Your Google AdSense Publisher ID (e.g. 'ca-pub-1234567890123456')
  CLIENT_ID: 'ca-pub-XXXXXXXXXXXXXXXX',

  // Ad Slot IDs from Google AdSense dashboard
  SLOTS: {
    TOP_LEADERBOARD: '1234567890',    // Responsive header banner (728x90 desktop / 320x100 mobile)
    MID_DOWNLOAD: '2345678901',       // High-CTR ad placed right above the download button
    ARTICLE_NATIVE: '3456789012',     // Responsive in-article native ad unit
    SIDEBAR_RECTANGLE: '4567890123',  // 300x250 medium rectangle for desktop
    STICKY_FOOTER: '5678901234'       // Mobile bottom floating adhesive banner
  },

  // Show placeholder badge in development/demo mode
  SHOW_PLACEHOLDERS: true
};

/**
 * Initialize AdSense script in <head> if enabled
 */
export function initAdSense() {
  if (ADS_CONFIG.ADS_ENABLED && ADS_CONFIG.CLIENT_ID && ADS_CONFIG.CLIENT_ID !== 'ca-pub-XXXXXXXXXXXXXXXX') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
}

/**
 * Render an ad block into a container element
 */
export function renderAd(containerId, slotKey, format = 'auto', sizeLabel = 'Responsive Ad') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (ADS_CONFIG.ADS_ENABLED) {
    container.innerHTML = `
      <div class="ads-wrapper">
        <span class="ad-label">ADVERTISEMENT</span>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${ADS_CONFIG.CLIENT_ID}"
             data-ad-slot="${ADS_CONFIG.SLOTS[slotKey] || ''}"
             data-ad-format="${format}"
             data-full-width-responsive="true"></ins>
      </div>
    `;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push error:', e);
    }
  } else if (ADS_CONFIG.SHOW_PLACEHOLDERS) {
    container.innerHTML = `
      <div class="ad-placeholder">
        <div class="ad-badge">ADVERTISEMENT</div>
        <div class="ad-content">
          <svg class="ad-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span class="ad-text">Google AdSense Slot (${sizeLabel})</span>
          <span class="ad-subtext">Monetization Ready &bull; High RPM Placement</span>
        </div>
      </div>
    `;
  }
}
