
import React, { useState, useEffect, useRef } from 'react';
import { DRAMATIC_MESSAGES } from '../constants';
import { Language } from '../types';

interface AnalysisAnimationProps {
  onCapture: (base64Image: string) => void;
  onComplete: () => void;
  lang: Language;
}

const AnalysisAnimation: React.FC<AnalysisAnimationProps> = ({ onCapture, onComplete, lang }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const capturedRef = useRef(false);

  const messages = DRAMATIC_MESSAGES[lang];

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError(true);
      }
    };

    startCamera();

    const duration = 10000; 
    const interval = 50;
    const step = 100 / (duration / interval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 60 && !capturedRef.current && videoRef.current && canvasRef.current) {
          capturedRef.current = true;
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            onCapture(base64);
          }
        }
        return next >= 100 ? 100 : next;
      });
    }, interval);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1100);

    const completionTimer = setTimeout(() => {
      onComplete();
    }, duration + 500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
      clearTimeout(completionTimer);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [onCapture, onComplete, messages.length]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 md:space-y-10 w-full max-w-4xl px-2 md:px-6 animate-slide-up">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="relative w-full aspect-[3/4] md:aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(147,51,234,0.1)] bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-60" />
        
        {/* Dynamic Scan Elements */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Main Scan Line */}
          <div className="absolute left-0 right-0 h-[1.5px] md:h-[2px] bg-purple-500 shadow-[0_0_20px_#9333ea]" style={{ top: `${progress}%`, transition: 'top 0.1s linear' }} />
          
          {/* Detailed Targeting Squares */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="grid grid-cols-4 grid-rows-4 w-full h-full opacity-20 border border-purple-500/20">
               {Array.from({length: 16}).map((_, i) => (
                 <div key={i} className={`border border-purple-500/10 ${i % 3 === 0 ? 'animate-pulse bg-purple-500/5' : ''}`}></div>
               ))}
             </div>
          </div>

          {/* Biometric Frame Corners */}
          <div className="absolute top-4 left-4 md:top-10 md:left-10 w-8 h-8 md:w-12 md:h-12 border-t-2 border-l-2 border-purple-500"></div>
          <div className="absolute top-4 right-4 md:top-10 md:right-10 w-8 h-8 md:w-12 md:h-12 border-t-2 border-r-2 border-purple-500"></div>
          <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 w-8 h-8 md:w-12 md:h-12 border-b-2 border-l-2 border-purple-500"></div>
          <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 w-8 h-8 md:w-12 md:h-12 border-b-2 border-r-2 border-purple-500"></div>

          {/* Rotating Data Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] md:w-[40%] aspect-square border-2 border-dashed border-purple-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] md:w-[45%] aspect-square border border-purple-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        </div>

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-40 p-6 md:p-10 text-center">
            <p className="text-red-400 font-bold tracking-widest uppercase text-[10px] md:text-sm">
              {lang === 'hi' ? 'कैमरा परमिशन जरूरी है' : 'Camera Access Required'}
            </p>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-4 md:space-y-6 w-full">
        <h2 className="text-white font-bebas text-3xl sm:text-5xl md:text-8xl tracking-widest drop-shadow-2xl h-16 md:h-24 flex items-center justify-center leading-tight">
          {messages[messageIndex]}
        </h2>
        <div className="flex flex-col items-center gap-2 md:gap-3">
           <div className="w-full max-w-[200px] md:max-w-xs h-[1.5px] md:h-[2px] bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
           </div>
           <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[7px] md:text-[9px] text-white/40 font-mono tracking-[0.1em] md:tracking-[0.2em] uppercase">
             <span>BIT-DEPTH: 24KB</span>
             <span>SCAN: {Math.floor(progress)}%</span>
             <span>TRUST: 99.8%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisAnimation;
