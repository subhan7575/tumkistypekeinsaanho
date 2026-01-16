
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PersonalityResult, Language } from '../types';
import AdUnit from './AdUnit';

interface ResultCardProps {
  result: PersonalityResult;
  onShare: (platform: string) => void;
  onReset?: () => void;
  lang: Language;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onShare, onReset, lang }) => {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const serialNumber = useMemo(() => result.id || `TRUTH-${Math.floor(Math.random() * 90000) + 10000}`, [result.id]);

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
      alert(lang === 'hi' ? "Naam likhna zaruri hai!" : "Name is required.");
      return;
    }
    setTimeLeft(10);
    setShowInterstitial(true);
  };

  const executeDownload = () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    canvas.width = 2400;
    canvas.height = 1800;
    const centerX = canvas.width / 2;
    const red = '#ef4444'; 
    const gold = '#c5a059';
    const darkGrey = '#1f2937';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = 'bold 300px serif';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
    ctx.textAlign = 'center';
    ctx.translate(centerX, 900);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText('CONFIDENTIAL', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = gold; ctx.lineWidth = 20;
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);
    ctx.restore();

    ctx.textAlign = 'left'; ctx.fillStyle = '#6b7280'; ctx.font = 'bold 28px monospace'; 
    ctx.fillText(`BIOMETRIC REPORT ID: ${serialNumber}`, 160, 200);

    ctx.textAlign = 'center'; ctx.fillStyle = gold; ctx.font = 'bold 110px serif';
    ctx.fillText('OFFICIAL TRUTH CERTIFICATE', centerX, 360);

    ctx.fillStyle = darkGrey; ctx.font = '900 160px serif'; ctx.fillText(userName.toUpperCase(), centerX, 730);

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      ctx.fillStyle = '#374151'; ctx.font = 'italic 46px serif'; ctx.textAlign = 'center';
      const words = text.split(' '); let line = ''; let currentY = y;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY); line = words[n] + ' '; currentY += lineHeight;
        } else line = testLine;
      }
      ctx.fillText(line, x, currentY); return currentY + lineHeight;
    };
    
    const nextY = wrapText(result.reportDescription, centerX, 930, 1800, 70);

    ctx.textAlign = 'left';
    ctx.font = 'bold 45px Inter';
    
    ctx.fillStyle = '#166534'; ctx.fillText('POSITIVE ATTRIBUTES:', centerX - 800, nextY + 150);
    ctx.font = '400 36px Inter'; ctx.fillStyle = '#374151';
    result.traits.forEach((p, i) => {
       ctx.fillText(`• ${p}`, centerX - 800, nextY + 230 + (i * 60));
    });

    ctx.font = 'bold 45px Inter'; ctx.fillStyle = '#991b1b';
    ctx.fillText('DETECTED FLAWS:', centerX + 100, nextY + 150);
    ctx.font = '400 36px Inter'; ctx.fillStyle = '#374151';
    result.weaknesses.forEach((p, i) => {
       ctx.fillText(`! ${p}`, centerX + 100, nextY + 230 + (i * 60));
    });

    ctx.textAlign = 'center'; ctx.fillStyle = gold; ctx.font = 'bold italic 60px serif';
    ctx.fillText(`"${result.darkLine}"`, centerX, canvas.height - 450);

    const drawStamp = (x: number, y: number) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08); 
      ctx.strokeStyle = red; ctx.fillStyle = red; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 208, 0, Math.PI * 2); ctx.stroke();
      ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center'; ctx.fillText('VERIFIED BY', 0, -25);
      ctx.font = '900 42px Arial'; ctx.fillText('TRUTH LAB', 0, 35); ctx.fillText('SACHI BAAT', 0, 85);
      ctx.restore();
    };
    drawStamp(canvas.width - 500, canvas.height - 350);

    const link = document.createElement('a');
    link.download = `SachiBaat_Verified_Report_${userName}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    setIsGenerating(false);
  };

  return (
    <div className="w-full space-y-8 md:space-y-12 animate-slide-up pb-10 md:pb-20">
      {showInterstitial && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-4 md:p-8 text-center animate-slow-fade overflow-y-auto">
          <div className="max-w-md w-full space-y-6 md:space-y-10 text-white py-8">
            <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto">
               <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]">Finalizing Unfiltered Report</h2>
            <AdUnit position="INTERSTITIAL" />
            <p className="text-5xl md:text-7xl font-bebas text-purple-500 animate-pulse">{timeLeft}s</p>
            <p className="text-[8px] md:text-[10px] text-white/30 tracking-[0.3em] md:tracking-[0.5em] uppercase">Honesty Check in Progress...</p>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-24 space-y-10 md:space-y-16 shadow-2xl mx-auto w-full max-w-7xl border-white/10 overflow-hidden">
        
        {/* Result Header */}
        <div className="space-y-4 md:space-y-6 text-center">
          <div className="flex flex-col items-center gap-1.5 md:gap-2 mb-4 md:mb-8">
            <span className="text-[8px] md:text-[10px] text-purple-400 font-bold uppercase tracking-[0.4em] md:tracking-[0.8em]">Truth Calibration</span>
            <div className="w-32 md:w-48 h-[1.5px] md:h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-purple-500 animate-[pulse_2s_infinite]" style={{ width: '98%' }}></div>
            </div>
          </div>
          <p className="text-purple-400 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.6em] md:tracking-[1em]">OFFICIAL ANALYSIS RESULT</p>
          <h1 className="text-4xl sm:text-7xl md:text-9xl font-bebas text-white uppercase tracking-tight leading-tight md:leading-none">{result.title}</h1>
        </div>
        
        {/* Main Content Body */}
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 text-left">
          <div className="space-y-6 md:space-y-10">
             <div className="border-l-4 md:border-l-8 border-purple-600 pl-4 md:pl-10">
                <p className="text-white/90 text-lg sm:text-2xl md:text-4xl leading-snug font-light font-serif">
                   "{result.description}"
                </p>
             </div>
             
             <div className="pl-4 md:pl-10">
               <p className="text-purple-400 font-bebas text-2xl sm:text-4xl md:text-6xl tracking-widest text-left opacity-90 leading-tight">
                 "{result.darkLine}"
               </p>
               <span className="text-[7px] md:text-[9px] text-white/20 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold block mt-1">— Neural Signature Code</span>
             </div>
          </div>

          {/* Traits and Weaknesses UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 pt-10 md:pt-16 border-t border-white/10">
            <div className="space-y-6 md:space-y-8 bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-green-500/20">
              <h3 className="text-green-400 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center gap-2 md:gap-3">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Positive Markers (Sahi Baat)
              </h3>
              <div className="space-y-3 md:space-y-4">
                {result.traits.map((trait, i) => (
                  <div key={i} className="flex items-start gap-3 md:gap-4 text-white/90 group">
                    <span className="text-green-500 font-bold text-sm md:text-base">✔</span>
                    <span className="text-base md:text-xl font-medium">{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-red-500/20">
              <h3 className="text-red-400 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center gap-2 md:gap-3">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse"></div>
                 Detected Flaws (Kharabiyan)
              </h3>
              <div className="space-y-3 md:space-y-4">
                {result.weaknesses.map((weak, i) => (
                  <div key={i} className="flex items-start gap-3 md:gap-4 text-white/90">
                    <span className="text-red-500 font-bold text-sm md:text-base">!</span>
                    <span className="text-base md:text-xl font-medium">{weak}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AdUnit position="MIDDLE" />

        {/* Action Section */}
        <div className="max-w-md mx-auto space-y-6 md:space-y-8 pt-8 md:pt-12 text-center">
          <div className="space-y-4">
            <input type="text" placeholder="WRITE NAME..." value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-6 py-4 md:py-6 text-white text-center font-bold text-lg md:text-xl focus:border-purple-500 outline-none placeholder:text-white/20" />
            <button onClick={handleDownloadClick} disabled={isGenerating} className="w-full py-4 md:py-6 bg-white text-black font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] rounded-xl md:rounded-2xl shadow-2xl hover:bg-purple-600 hover:text-white transition-all text-xs md:text-sm">
              {isGenerating ? 'GENERATING...' : 'DOWNLOAD TRUTH REPORT'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button onClick={() => window.open(`https://wa.me/?text=Mera asli sach dekho: ${window.location.href}`)} className="bg-white/5 py-3 md:py-4 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] border border-white/5 hover:bg-white/10 transition-colors">WhatsApp</button>
            <button onClick={() => {navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2000)}} className="bg-white/5 py-3 md:py-4 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] border border-white/5 hover:bg-white/10 transition-colors">{copied ? 'COPIED' : 'COPY LINK'}</button>
          </div>
          
          {onReset && <button onClick={onReset} className="w-full py-2 text-white/20 text-[8px] md:text-[10px] font-bold tracking-[0.4em] md:tracking-[0.5em] uppercase hover:text-white transition-colors">Analyze Someone Else</button>}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ResultCard;
