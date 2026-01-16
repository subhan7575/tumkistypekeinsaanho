
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import AdUnit from './components/AdUnit';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'sachi_baat_personality_v16'; 

export const LogoIcon = ({ className = "w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6", showGlow = true }) => (
  <div className={`${className} relative animate-slow-fade`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M50 5L12 26v48l38 21 38-21V26L50 5z" stroke="url(#logo-grad)" strokeWidth="2" fill="rgba(147, 51, 234, 0.1)"/>
      <circle cx="50" cy="50" r="18" stroke="url(#logo-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]"/>
      <circle cx="50" cy="50" r="8" fill="url(#logo-grad)" />
      <path d="M35 50h6M59 50h6M50 35v6M50 59v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    {showGlow && <div className="absolute inset-0 bg-purple-500/20 blur-3xl -z-10 animate-pulse"></div>}
  </div>
);

export default function App() {
  const [state, setState] = useState<AppState>(AppState.INITIAL);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [lang, setLang] = useState<Language>('hi');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const apiDataRef = useRef<PersonalityResult | null>(null);
  const animationFinishedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResult(JSON.parse(saved));
        setState(AppState.RESULT);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleStart = () => {
    setResult(null);
    setErrorMessage(null);
    apiDataRef.current = null;
    animationFinishedRef.current = false;
    setState(AppState.ANALYZING);
  };

  const tryTransitionToResult = () => {
    if (apiDataRef.current && animationFinishedRef.current) {
      setResult(apiDataRef.current);
      setState(AppState.RESULT);
    }
  };

  const performAnalysis = async (base64: string) => {
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === 'undefined') {
      console.error("Critical: API_KEY is missing in process.env");
      setErrorMessage(lang === 'hi' ? "System Error: API Key nahi mil rahi. Vercel Dashboard mein 'API_KEY' add karein." : "System Error: API Key not found. Please add it to Vercel environment variables.");
      setState(AppState.ERROR);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const instructions = lang === 'hi' 
      ? `You are the 'Sachi Baat' Personality Engine. 
         Analyze the face in the image with extreme detail.
         STRICT RULE: Do not be overly nice. Be raw, honest, and slightly witty.
         
         OUTPUT MUST BE VALID JSON:
         - title: Catchy Roman Urdu title (e.g. 'Azeem Lead' or 'Masoom Shaitan').
         - description: Paragraph in Roman Urdu addressing the user as 'Aap'.
         - reportDescription: Formal 3rd person personality summary.
         - darkLine: One raw viral signature line.
         - traits: Array of 3 key strengths.
         - weaknesses: Array of 2 actual human flaws.`
      : `Analyze the face deeply and be honest. Provide JSON with title, description, reportDescription, darkLine, traits, and weaknesses.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: "Analyze this person's face and provide a raw, honest personality profile." }
          ]
        },
        config: {
          systemInstruction: instructions,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              reportDescription: { type: Type.STRING },
              darkLine: { type: Type.STRING },
              traits: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "reportDescription", "darkLine", "traits", "weaknesses"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      const finalResult: PersonalityResult = {
        id: `TRUTH-${Math.floor(Math.random() * 90000) + 10000}`,
        ...data,
        color: "#9333ea",
        shareHook: "Mera asli aur kadwa sach dekho!"
      };

      apiDataRef.current = finalResult;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));
      tryTransitionToResult();
    } catch (err: any) {
      console.error("AI Analysis Failed:", err);
      setErrorMessage(err.message || "Neural link interrupted. Please try again.");
      setState(AppState.ERROR);
    }
  };

  const handleCapture = (base64: string) => {
    performAnalysis(base64);
  };

  const handleAnimationComplete = useCallback(() => {
    animationFinishedRef.current = true;
    tryTransitionToResult();
  }, []);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setErrorMessage(null);
    apiDataRef.current = null;
    animationFinishedRef.current = false;
    setState(AppState.INITIAL);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center z-10 bg-neural-gradient selection:bg-purple-600 selection:text-white overflow-x-hidden">
      <AdUnit position="SIDE_LEFT" />
      <AdUnit position="SIDE_RIGHT" />

      <nav className="w-full flex justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-7xl animate-slow-fade">
        <div className="flex items-center gap-2 md:gap-3">
           <LogoIcon className="w-8 h-8 md:w-10 md:h-10" showGlow={false} />
           <div className="flex flex-col">
             <span className="text-[10px] md:text-xs text-white font-black tracking-widest leading-none">SACHI BAAT</span>
             <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/40 font-bold">Truth Lab v3.3</span>
           </div>
        </div>
        <div className="flex bg-white/5 rounded-lg md:rounded-xl border border-white/5 p-1 backdrop-blur-md">
          <button onClick={() => setLang('hi')} className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest transition-all ${lang === 'hi' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/30 hover:text-white'}`}>URDU</button>
          <button onClick={() => setLang('en')} className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest transition-all ${lang === 'en' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/30 hover:text-white'}`}>ENGLISH</button>
        </div>
      </nav>

      <AdUnit position="HEADER" />

      <main className="flex-1 w-full flex flex-col items-center justify-center py-4 md:py-8 px-4 md:px-6">
        {state === AppState.INITIAL && (
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12 animate-slide-up max-w-4xl w-full">
            <LogoIcon />
            <div className="space-y-3 md:space-y-6">
              <h1 className="text-6xl sm:text-8xl md:text-[10rem] font-bebas tracking-tighter text-white uppercase leading-[0.85] drop-shadow-[0_10px_30px_rgba(147,51,234,0.3)]">
                {lang === 'hi' ? 'SACHI' : 'PURE'} <span className="text-purple-500 block md:inline">{lang === 'hi' ? 'BAAT' : 'TRUTH'}</span>
              </h1>
              <p className="text-white/50 text-[10px] sm:text-xs md:text-xl font-light tracking-[0.3em] md:tracking-[0.6em] uppercase px-2 md:px-4">Biometric Truth Lab • Neural Analysis</p>
            </div>
            <button onClick={handleStart} className="w-full max-w-xs md:max-w-none md:w-auto px-10 md:px-20 py-5 md:py-8 bg-white text-black font-black tracking-[0.2em] rounded-2xl md:rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.1)] border border-white/20 text-xs md:text-lg uppercase">
              {lang === 'hi' ? 'KADWA SACH JAANEIN' : 'START TRUTH SCAN'}
            </button>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="w-full flex flex-col items-center gap-6 md:gap-8">
            <AnalysisAnimation onCapture={handleCapture} onComplete={handleAnimationComplete} lang={lang} />
            {animationFinishedRef.current && !apiDataRef.current && (
              <div className="flex flex-col items-center gap-3">
                 <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                 <div className="text-purple-400 font-bold animate-pulse text-[10px] md:text-xs tracking-widest uppercase">
                  {lang === 'hi' ? 'Server Response Ka Intezar...' : 'Awaiting Final Neural Signature...'}
                </div>
              </div>
            )}
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 animate-slide-up bg-red-500/10 p-8 md:p-14 rounded-3xl border border-red-500/20 shadow-2xl max-w-md w-full">
            <div className="text-red-500 text-5xl md:text-7xl font-bold">!</div>
            <h2 className="text-2xl md:text-3xl font-bebas text-white tracking-widest uppercase">Analysis Failed</h2>
            <p className="text-white/60 text-sm md:text-base leading-relaxed">{errorMessage}</p>
            <div className="pt-6 flex flex-col gap-3 w-full">
               <button onClick={handleReset} className="w-full py-4 md:py-5 bg-white text-black font-black rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-widest">Try Again</button>
               <p className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-widest">Check camera permissions</p>
            </div>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="w-full max-w-6xl animate-slide-up">
            <ResultCard result={result} onShare={() => {}} lang={lang} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="w-full py-10 md:py-16 flex flex-col items-center gap-2 border-t border-white/5 bg-black/40 backdrop-blur-3xl mt-auto px-4 text-center">
        <p className="text-[9px] md:text-[11px] text-white/40 uppercase tracking-[0.4em] font-bold">Proprietary Biometric Algorithm by Subhan Ahmad</p>
        <p className="text-[7px] md:text-[9px] text-white/10 uppercase tracking-[0.6em]">Encrypted Data Transmission © 2025</p>
      </footer>
    </div>
  );
}
