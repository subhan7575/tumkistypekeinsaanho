
import React, { useEffect } from 'react';
import { AD_CONFIG } from '../adConfig';

export type AdPosition = 'HEADER' | 'MIDDLE' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'BOTTOM' | 'INTERSTITIAL';

interface AdUnitProps {
  position: AdPosition;
}

const AdUnit: React.FC<AdUnitProps> = ({ position }) => {
  
  // Safe environment access
  const env = (typeof process !== 'undefined' ? process.env : {}) as any;
  const adClientId = env.AD_CLIENT_ID || AD_CONFIG.AD_CLIENT_ID;
  
  const getSlotId = () => {
    switch (position) {
      case 'HEADER': return env.AD_SLOT_HEADER || AD_CONFIG.SLOTS.HEADER;
      case 'MIDDLE': return env.AD_SLOT_MIDDLE || AD_CONFIG.SLOTS.MIDDLE;
      case 'SIDE_LEFT': return env.AD_SLOT_SIDE_LEFT || AD_CONFIG.SLOTS.SIDE_LEFT;
      case 'SIDE_RIGHT': return env.AD_SLOT_SIDE_RIGHT || AD_CONFIG.SLOTS.SIDE_RIGHT;
      case 'BOTTOM': return env.AD_SLOT_BOTTOM || AD_CONFIG.SLOTS.BOTTOM;
      case 'INTERSTITIAL': return env.AD_SLOT_INTERSTITIAL || AD_CONFIG.SLOTS.INTERSTITIAL;
      default: return null;
    }
  };

  const slotId = getSlotId();

  useEffect(() => {
    if (slotId && adClientId !== 'ca-pub-placeholder' && !AD_CONFIG.CUSTOM_ADS.ENABLED) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [slotId, adClientId]);

  const getStyle = () => {
    switch (position) {
      case 'HEADER': return 'w-full max-w-4xl mx-auto h-[90px] mb-6';
      case 'MIDDLE': return 'w-full max-w-2xl mx-auto h-[250px] my-10';
      case 'SIDE_LEFT': return 'hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 w-[160px] h-[600px]';
      case 'SIDE_RIGHT': return 'hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 w-[160px] h-[600px]';
      case 'BOTTOM': return 'w-full max-w-4xl mx-auto h-[90px] mt-10';
      case 'INTERSTITIAL': return 'w-full max-w-lg aspect-square md:h-[400px]';
      default: return 'w-full';
    }
  };

  if (AD_CONFIG.CUSTOM_ADS.ENABLED) {
    return (
      <div className={`ad-wrapper z-20 flex items-center justify-center overflow-hidden ${getStyle()}`}>
        <a href={AD_CONFIG.CUSTOM_ADS.REDIRECT_URL} target="_blank" rel="noopener noreferrer" className="relative w-full h-full">
          <img 
            src={AD_CONFIG.CUSTOM_ADS.IMAGE_URL} 
            alt="Advertisement" 
            className="w-full h-full object-cover rounded-xl border border-white/10"
          />
          <div className="absolute top-1 right-1 bg-black/50 px-2 py-0.5 rounded text-[8px] uppercase tracking-tighter text-white/70">Ad</div>
        </a>
      </div>
    );
  }

  return (
    <div className={`ad-wrapper z-20 flex items-center justify-center overflow-hidden ${getStyle()}`}>
      <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 group hover:border-purple-500/30 transition-colors">
        
        <span className="text-[9px] text-gray-700 uppercase tracking-[0.5em] font-bold opacity-40 group-hover:opacity-100 transition-opacity mb-1 z-10">
          Advertisement
        </span>
        
        {slotId && adClientId !== 'ca-pub-placeholder' ? (
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', height: '100%' }}
               data-ad-client={adClientId}
               data-ad-slot={slotId}
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
             <div className="text-[10px] text-purple-400 font-mono text-center uppercase tracking-widest px-4">
              {position} AD UNIT<br/>
              <span className="text-white/40 text-[8px] lowercase block mt-1">
                Edit: adConfig.ts {"->"} {position}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdUnit;
