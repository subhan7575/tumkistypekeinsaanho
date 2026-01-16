
import React, { useState, useRef, useEffect } from 'react';
import { PersonalityResult, Language } from '../types';
import AdUnit from './AdUnit';

interface ResultCardProps {
  result: PersonalityResult;
  onShare: (platform: string) => void;
  onReset?: () => void;
  lang: Language;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onShare, onReset, lang }) => {
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let timer: number;
    if (showInterstitial && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (showInterstitial && timeLeft === 0) {
      executeDownload();
      setShowInterstitial(false);
    }
    return () => clearInterval(timer);
  }, [showInterstitial, timeLeft]);

  const handleDownloadClick = () => {
    if (!userName.trim()) {
      alert(lang === 'hi' ? "Pehle apna naam likhein!" : "Please write your name first!");
      return;
    }
    setTimeLeft(10);
    setShowInterstitial(true);
  };

  const executeDownload = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    canvas.width = 2400;
    canvas.height = 1800;
    const centerX = canvas.width / 2;
    const gold = '#c5a059';
    const darkGrey = '#111827';
    const lightBg = '#f9fafb';

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, fontSize: number, style: string = 'bold', color: string = '#4b5563', align: CanvasTextAlign = 'center') => {
      ctx.fillStyle = color; 
      ctx.font = `${style} ${fontSize}px serif`; 
      ctx.textAlign = align;
      const words = text.split(' '); 
      let line = ''; 
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    const calculateWrapHeight = (text: string, maxWidth: number, lineHeight: number, fontSize: number, style: string) => {
      ctx.font = `${style} ${fontSize}px serif`;
      const words = text.split(' ');
      let line = '';
      let lineCount = 1;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          line = words[n] + ' ';
          lineCount++;
        } else {
          line = testLine;
        }
      }
      return lineCount * lineHeight;
    };

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = gold; ctx.lineWidth = 20;
    ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);
    ctx.strokeStyle = gold; ctx.lineWidth = 5;
    ctx.strokeRect(100, 100, canvas.width - 200, canvas.height - 200);
    ctx.restore();

    ctx.textAlign = 'left'; ctx.fillStyle = '#9ca3af'; ctx.font = 'bold 28px monospace'; 
    ctx.fillText(`${lang === 'hi' ? 'VERIFIED REPORT' : 'AUTH REPORT'}: ${result.id}`, 160, 160);

    const mainTitle = lang === 'hi' ? 'Tum Kis Type Ke Insaan Ho Official Certificate' : 'What Type Of Person You Are Official Certificate';
    // Enhanced wrapping and smaller font size to prevent box escape
    const titleYEnd = wrapText(mainTitle.toUpperCase(), centerX, 220, 1600, 70, 58, 'bold', gold);

    ctx.fillStyle = darkGrey; ctx.font = '900 135px serif'; 
    ctx.fillText(userName.toUpperCase(), centerX, titleYEnd + 120);

    const descYStart = titleYEnd + 210;
    const descYEnd = wrapText(result.reportDescription, centerX, descYStart, 1800, 50, 34, 'italic', '#4b5563');

    const sherMaxWidth = 1500;
    const sherFontSize = 52;
    const sherLineHeight = 68;
    const sherText = `"${result.darkLine}"`;
    const sherContentHeight = calculateWrapHeight(sherText, sherMaxWidth, sherLineHeight, sherFontSize, 'italic bold');
    
    const boxY = descYEnd + 40;
    const boxWidth = 1700;
    const boxX = centerX - (boxWidth / 2);
    const boxHeight = sherContentHeight + 110;

    ctx.save();
    ctx.fillStyle = lightBg;
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    };
    roundRect(boxX, boxY, boxWidth, boxHeight, 30);
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center'; ctx.fillStyle = gold; ctx.font = 'bold 24px Inter';
    ctx.fillText(lang === 'hi' ? 'CHARACTER COUPLET (SHER)' : 'PERSONAL REFLECTION', centerX, boxY + 45);

    wrapText(sherText, centerX, boxY + 110, sherMaxWidth, sherLineHeight, sherFontSize, 'italic bold', '#111827');

    const pointsYStart = boxY + boxHeight + 70;
    const pointSpacing = 60;
    
    ctx.textAlign = 'left'; ctx.font = 'bold 44px Inter'; ctx.fillStyle = '#166534';
    ctx.fillText(lang === 'hi' ? 'KHOOBIYAN (STRENGTHS):' : 'STRENGTHS:', 200, pointsYStart);
    ctx.font = '500 36px Inter'; ctx.fillStyle = '#374151';
    result.traits.forEach((trait, i) => {
      ctx.fillText(`✓  ${trait}`, 200, pointsYStart + 75 + (i * pointSpacing));
    });

    ctx.textAlign = 'left'; ctx.font = 'bold 44px Inter'; ctx.fillStyle = '#991b1b';
    ctx.fillText(lang === 'hi' ? 'KHARABIYAN (WEAKNESSES):' : 'WEAKNESSES:', 1300, pointsYStart);
    ctx.font = '500 36px Inter'; ctx.fillStyle = '#374151';
    result.weaknesses.forEach((flaw, i) => {
      ctx.fillText(`✕  ${flaw}`, 1300, pointsYStart + 75 + (i * pointSpacing));
    });

    ctx.textAlign = 'center'; ctx.fillStyle = '#9ca3af'; ctx.font = 'bold 28px Inter';
    ctx.fillText(lang === 'hi' ? "Tum Kis Type Ke Insaan Ho Lab Verification © 2025" : "Official Character Biometric Lab Verification © 2025", centerX, canvas.height - 120);

    const drawStamp = async () => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        // STRICTLY USE STAMP.PNG
        img.src = 'https://i.ibb.co/68qV21W/stump.png';
        img.onload = () => {
          ctx.save();
          const stampSize = 580; 
          ctx.translate(canvas.width - 750, canvas.height - 750);
          ctx.rotate(-0.01); 
          ctx.drawImage(img, 0, 0, stampSize, stampSize);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    await drawStamp();

    const link = document.createElement('a');
    link.download = `TumKisTypeKeInsaanHo_Certificate_${userName.trim().replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    setIsGenerating(false);
  };

  return (
    <div className="w-full space-y-12 md:space-y-24 animate-slide-up pb-12 md:pb-24 px-4 md:px-0">
      <canvas ref={canvasRef} className="hidden" />
      
      {showInterstitial && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-6 text-center animate-slow-fade backdrop-blur-3xl">
          <div className="max-w-2xl w-full space-y-8 md:space-y-12 text-white">
            <h2 className="text-xl md:text-5xl font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-purple-400">
              {lang === 'hi' ? 'CERTIFICATE TAYYAR HAI' : 'GENERATING OFFICIAL REPORT'}
            </h2>
            <div className="p-4 md:p-8 bg-white/5 rounded-2xl md:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
               <AdUnit position="INTERSTITIAL" />
            </div>
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <p className="text-6xl md:text-[12rem] font-bebas text-white animate-pulse leading-none">{timeLeft}s</p>
              <p className="text-[10px] md:text-sm text-purple-500/60 tracking-[0.5em] md:tracking-[1em] font-black uppercase">
                {lang === 'hi' ? 'Scanning Your Soul' : 'Validating Your Identity'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[3rem] md:rounded-[5rem] p-6 md:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] mx-auto w-full max-w-[1500px] border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[30rem] md:w-[60rem] h-[30rem] md:h-[60rem] bg-purple-600/10 blur-[150px] -z-10 rounded-full"></div>
        
        <div className="text-center mb-16 md:mb-32">
          <p className="text-purple-400 text-[10px] md:text-sm font-black uppercase tracking-[1em] mb-6">
            {lang === 'hi' ? 'VERIFIED BIOMETRIC ANALYSIS' : 'AUTHENTICATED PERSONALITY REPORT'}
          </p>
          <h2 className="text-4xl md:text-9xl font-bebas tracking-tighter text-white mb-8 md:mb-12 leading-tight">{result.title}</h2>
          <p className="text-white/70 text-lg md:text-4xl max-w-5xl mx-auto font-medium leading-relaxed italic border-b border-white/10 pb-12 md:pb-16 px-4">
             {result.description}
          </p>
          <p className="text-white/50 text-base md:text-2xl max-w-4xl mx-auto mt-12 md:mt-16 leading-relaxed font-light">
             {result.reportDescription}
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-16 md:mb-32">
           <div className="relative p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 bg-white/[0.03] overflow-hidden group shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
              <p className="text-[10px] md:text-xs font-black tracking-[0.6em] text-purple-400/80 uppercase mb-8 text-center">CHARACTER SOUL COUPLET (SHER)</p>
              <p className="text-2xl md:text-6xl font-serif italic text-white leading-snug md:leading-tight text-center relative z-10">
                "{result.darkLine}"
              </p>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-24 mb-16 md:mb-32">
          <div className="p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-green-500/[0.03] border border-green-500/10 backdrop-blur-3xl">
            <h3 className="text-green-400 font-black uppercase tracking-[0.4em] text-[12px] md:text-lg mb-10 md:mb-16 flex items-center gap-4">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_20px_#4ade80]"></span>
              {lang === 'hi' ? 'POSITIVE KHOOBIYAN' : 'CORE STRENGTHS'}
            </h3>
            <ul className="space-y-6 md:space-y-10">
              {result.traits.map((t, i) => (
                <li key={i} className="text-white/90 text-lg md:text-3xl flex items-start gap-6 font-semibold group">
                  <span className="text-green-400 text-3xl md:text-5xl leading-none group-hover:scale-125 transition-transform duration-300">✓</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-red-500/[0.03] border border-red-500/10 backdrop-blur-3xl">
            <h3 className="text-red-400 font-black uppercase tracking-[0.4em] text-[12px] md:text-lg mb-10 md:mb-16 flex items-center gap-4">
              <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-[0_0_20px_#f87171]"></span>
              {lang === 'hi' ? 'HIDDEN KHARABIYAN' : 'AREAS FOR GROWTH'}
            </h3>
            <ul className="space-y-6 md:space-y-10">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="text-white/90 text-lg md:text-3xl flex items-start gap-6 font-semibold group">
                  <span className="text-red-400 text-3xl md:text-5xl leading-none group-hover:scale-125 transition-transform duration-300">✕</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-10 md:space-y-16 max-w-5xl mx-auto border-t border-white/5 pt-16 md:pt-24">
          <div className="space-y-6 md:space-y-10">
            <label className="block text-[10px] md:text-sm font-black tracking-[0.5em] uppercase opacity-30 text-center">
              {lang === 'hi' ? 'Name for Certificate Validation' : 'Enter Legal Name for Official Seal'}
            </label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={lang === 'hi' ? "APNA NAAM LIKHEIN..." : "YOUR FULL NAME..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[3rem] py-6 md:py-14 px-8 md:px-12 text-center text-2xl md:text-6xl font-black focus:outline-none focus:border-purple-500 transition-all placeholder:opacity-5 focus:bg-white/10 shadow-inner"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center">
            <button 
              onClick={handleDownloadClick}
              disabled={isGenerating}
              className="flex-[2] px-8 py-6 md:py-14 bg-white text-black font-black text-lg md:text-3xl rounded-2xl md:rounded-[3rem] transition-all flex items-center justify-center gap-6 disabled:opacity-50 hover:scale-[1.03] active:scale-[0.98] shadow-[0_20px_60px_rgba(255,255,255,0.1)] group"
            >
              {isGenerating ? (lang === 'hi' ? 'GENERATING...' : 'PREPARING...') : (lang === 'hi' ? 'DOWNLOAD CERTIFICATE' : 'DOWNLOAD TRUTH CERTIFICATE')}
            </button>
            {onReset && (
              <button 
                onClick={onReset}
                className="flex-1 px-8 py-6 md:py-14 bg-white/5 hover:bg-white/10 text-white font-black text-lg md:text-3xl rounded-2xl md:rounded-[3rem] transition-all border border-white/10"
              >
                {lang === 'hi' ? 'RE-SCAN' : 'NEW SCAN'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
