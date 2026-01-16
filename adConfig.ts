
/**
 * 📢 AD CONFIGURATION CENTER (ADS SETTINGS)
 * -------------------------------------------------------------------------
 * Yahan aap apni Google AdSense IDs ya Custom Banner links paste kar sakte hain.
 * Har cheez ke saath uska naam likha hua hai taake aapko mushkil na ho.
 * -------------------------------------------------------------------------
 */

export const AD_CONFIG = {
  // 1️⃣ GLOBAL PUBLISHER ID: Apna Google AdSense ID yahan dalein (e.g., "ca-pub-1234567890")
  // Ye main ID hoti hai jo poori site par ads chalane ke liye zaruri hai.
  AD_CLIENT_ID: "ca-app-pub-6121799382774662~3282026967", 

  // 2️⃣ SPECIFIC SLOT IDs: Har jagha ke liye alag ID (e.g., "1234567890")
  // Google AdSense mein "Display Ads" create karein aur unki IDs yahan paste karein:
  SLOTS: {
    // HEADER AD: Website ke sabse oopar (Top) nazar aane wala ad.
    HEADER: "ca-app-pub-6121799382774662/6495331900",        

    // MIDDLE AD: Result card ke andar, Khoobiyan aur Kharabiyan ke pass.
    MIDDLE: "2345678901",        

    // BOTTOM AD: Website ke sabse neeche, Footer se oopar.
    BOTTOM: "ca-app-pub-6121799382774662/6495331900",        

    // INTERSTITIAL AD: Download button dabane ke baad 10s wait ke waqt nazar aane wala ad.
    INTERSTITIAL: "ca-app-pub-6121799382774662/6495331900",  
  },

  // 3️⃣ CUSTOM BANNER ADS (Agar Google Ads use nahi kar rahe)
  // Isko tab use karein agar aap apni marzi ki image aur link lagana chahte hain.
  CUSTOM_ADS: {
    ENABLED: false, // Isko 'true' karein agar image wala ad chalana hai.
    IMAGE_URL: "https://via.placeholder.com/300x250", // Ad image ka link.
    REDIRECT_URL: "https://your-link.com" // Click karne par kahan jaye user.
  }
};
