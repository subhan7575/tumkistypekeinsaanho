/**
 * 📢 AD CONFIGURATION CENTER (ADS SETTINGS)
 * -------------------------------------------------------------------------
 */

export const AD_CONFIG = {
  // 1️⃣ GLOBAL PUBLISHER ID: Updated with user's ID
  AD_CLIENT_ID: "ca-pub-6121799382774662", 

  <amp-ad width="100vw" height="320"
     type="adsense"
     AD_CLIENT_ID="ca-pub-6121799382774662"
     data-ad-slot="6759905846"
     data-auto-format="rspv"
     data-full-width="">
  <div overflow=""></div>
</amp-ad>

  // 2️⃣ SPECIFIC SLOT IDs: (Replace these with your actual display ad unit IDs from AdSense)
  SLOTS: {
    HEADER: "6759905846",        
    MIDDLE: "2345678901",        
    BOTTOM: "5678901234",        
    INTERSTITIAL: "6789012345",  
  },

  // 3️⃣ CUSTOM BANNER ADS
  CUSTOM_ADS: {
    ENABLED: false,
    IMAGE_URL: "https://via.placeholder.com/300x250",
    REDIRECT_URL: "https://your-link.com"
  }
};
