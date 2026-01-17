import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../adConfig';

export type AdPosition = 'HEADER' | 'MIDDLE' | 'BOTTOM' | 'INTERSTITIAL';

interface AdUnitProps {
  position: AdPosition;
}

const AdUnit: React.FC<AdUnitProps> = ({ position }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const env = (typeof process !== 'undefined' ? process.env : {}) as any;
  const adClientId = env.AD_CLIENT_ID || AD_CONFIG.AD_CLIENT_ID;
  
  const getSlotId = () => {
    switch (position) {
      case 'HEADER': return env.AD_SLOT_HEADER || AD_CONFIG.SLOTS.HEADER;
      case 'MIDDLE': return env.AD_SLOT_MIDDLE || AD_CONFIG.SLOTS.MIDDLE;
      case 'BOTTOM': return env.AD_SLOT_BOTTOM || AD_CONFIG.SLOTS.BOTTOM;
      case 'INTERSTITIAL': return env.AD_SLOT_INTERSTITIAL || AD_CONFIG.SLOTS.INTERSTITIAL;
      default: return null;
    }
  };

  const slotId = getSlotId();

  useEffect(() => {
    // Only push if configured and container is visible/has width
    if (slotId && adClientId && adClientId !== 'ca-pub-placeholder' && !AD_CONFIG.CUSTOM_ADS.ENABLED) {
      const initAd = () => {
        try {
          if (containerRef.current && containerRef.current.offsetWidth > 0) {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } else {
            // Retry once after a small delay if width is 0 (common during initial animation)
            setTimeout(() => {
              try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
              } catch (retryErr) {
                console.warn('AdSense retry failed:', retryErr);
              }
            }, 500);
          }
        } catch (e) {
          console.error('AdSense error:', e);
        }
      };

      // Small delay to ensure layout is calculated
      const timer = setTimeout(initAd, 200);
      return () => clearTimeout(timer);
    }
  }, [slotId, adClientId]);

  const getStyle = () => {
    switch (position) {
      case 'HEADER': return 'w-full max-w-5xl mx-auto min-h-[90px] md:min-h-[150px] mb-8';
      case 'MIDDLE': return 'w-full max-w-4xl mx-auto min-h-[250px] md:min-h-[350px] my-10';
      case 'BOTTOM': return 'w-full max-w-5xl mx-auto min-h-[120px] mt-10 mb-6';
      case 'INTERSTITIAL': return 'w-full max-w-md aspect-square rounded-3xl';
      default: return 'w-full';
    }
  };

  const isConfigured = slotId && adClientId && adClientId !== 'ca-pub-placeholder';

  return (
    <div 
      ref={containerRef}
      className={`ad-container relative flex items-center justify-center overflow-hidden transition-all duration-500 ${getStyle()} ${!isConfigured ? 'ad-glow-visible' : ''}`}
    >
      {AD_CONFIG.CUSTOM_ADS.ENABLED ? (
        <a href={AD_CONFIG.CUSTOM_ADS.REDIRECT_URL} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
          <img src={AD_CONFIG.CUSTOM_ADS.IMAGE_URL} alt="Custom Ad" className="w-full h-full object-cover rounded-2xl" />
        </a>
      ) : isConfigured ? (
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '100%' }}
             data-ad-client={adClientId}
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-500/10 border-2 border-dashed border-purple-500/40 rounded-3xl p-6 text-center backdrop-blur-sm">
          <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(147,51,234,0.5)] animate-bounce">
             <span className="text-white font-black text-2xl">$</span>
          </div>
          <h3 className="text-white font-black text-lg md:text-2xl uppercase tracking-[0.2em] mb-2">
             {position} AD SPACE
          </h3>
          <p className="text-purple-400 font-bold text-[10px] md:text-sm uppercase tracking-[0.3em] mb-4">
            ( {position === 'HEADER' ? 'TOP BANNER' : position === 'BOTTOM' ? 'FOOTER BANNER' : position === 'MIDDLE' ? 'REPORT AD' : 'DOWNLOAD POPUP AD'} )
          </p>
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <code className="text-[10px] text-white/40 uppercase">Slot ID: {slotId || 'Empty'}</code>
          </div>
          <p className="mt-4 text-[9px] text-white/20 uppercase tracking-[0.5em]">
            Paste ID in adConfig.ts to Activate
          </p>
        </div>
      )}
    </div>
  );
};

export default AdUnit;
