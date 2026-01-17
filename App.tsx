import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import { GoogleGenAI, Type } from '@google/genai';

const STORAGE_KEY = 'sachi_baat_personality_v18'; 

export const LogoIcon = ({ className = "w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6" }) => (
  <div className={`${className} relative`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M50 5L12 26v48l38 21 38-21V26L50 5z" stroke="url(#logo-grad)" strokeWidth="2" fill="rgba(147, 51, 234, 0.1)"/>
      <circle cx="50" cy="50" r="18" stroke="url(#logo-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]"/>
      <circle cx="50" cy="50" r="8" fill="url(#logo-grad)" />
    </svg>
    <div className="absolute inset-0 bg-purple-500/20 blur-3xl -z-10 animate-pulse"></div>
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
    if (saved && ![AppState.ABOUT, AppState.PRIVACY].includes(state)) {
      try {
        const parsed = JSON.parse(saved);
        setResult(parsed);
        setState(AppState.RESULT);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    window.scrollTo(0, 0);
  }, [state]);

  const handleStart = () => {
    setResult(null);
    setErrorMessage(null);
    apiDataRef.current = null;
    animationFinishedRef.current = false;
    setState(AppState.ANALYZING);
  };

  const tryTransitionToResult = useCallback(() => {
    if (apiDataRef.current && animationFinishedRef.current) {
      setResult(apiDataRef.current);
      setState(AppState.RESULT);
    }
  }, []);

  const performAnalysis = async (base64: string) => {
    try {
      const apiKey = process.env.API_KEY?.trim().replace(/^["']|["']$/g, '');
      
      if (!apiKey || apiKey === 'your_real_key_here' || apiKey.length < 10) {
        throw new Error('API_KEY is missing or invalid in .env file.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const instructions = lang === 'hi'
        ? `You are the 'Sachi Baat' Personality Engine. Analyze facial features for true character traits. Be extremely honest, bold, and edgy. ALL TEXT OUTPUT MUST BE IN ROMAN URDU (Urdu in English script). Return JSON: title, description (1-line), reportDescription (3 sentences), darkLine (Roman Urdu Sher), traits (5 strings), weaknesses (4 strings).`
        : `Analyze facial features for personality traits. Be unfiltered and bold. Return JSON: title, description (1-line), reportDescription (3 sentences), darkLine (Philosophical quote), traits (5 strings), weaknesses (4 strings).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: "Perform deep biometric analysis on this face and reveal their true personality. Be brutally honest." }
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

      const textOutput = response.text;
      if (!textOutput) throw new Error("AI returned no content.");
      
      const data = JSON.parse(textOutput);

      const finalResult: PersonalityResult = {
        id: `TRUTH-${Math.floor(Math.random() * 90000) + 10000}`,
        ...data,
        color: "#9333ea",
        shareHook: lang === 'hi' ? "Mera asli sach dekho!" : "See my unfiltered truth!"
      };

      apiDataRef.current = finalResult;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));
      tryTransitionToResult();
    } catch (err: any) {
      console.error("Analysis Error:", err);
      let msg = err.message || 'Something went wrong';
      if (msg.includes('API key not valid')) {
        msg = "The API Key in your .env is invalid. Please get a new one from AI Studio.";
      }
      setErrorMessage(msg);
      setState(AppState.ERROR);
    }
  };

  const handleCapture = (base64: string) => performAnalysis(base64);
  const handleAnimationComplete = useCallback(() => {
    animationFinishedRef.current = true;
    tryTransitionToResult();
  }, [tryTransitionToResult]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setErrorMessage(null);
    setState(AppState.INITIAL);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#05070a] text-white overflow-x-hidden font-inter">
      <div className="fixed inset-0 bg-neural-gradient -z-10 pointer-events-none"></div>

      {![AppState.ABOUT, AppState.PRIVACY].includes(state) && (
        <nav className="w-full flex justify-between items-center px-4 md:px-12 py-5 md:py-8 max-w-[1400px] mx-auto z-50">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => setState(AppState.INITIAL)}>
             <LogoIcon className="w-6 h-6 md:w-10 md:h-10" />
             <span className="text-[8px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.3em] opacity-60 uppercase whitespace-nowrap">
               {lang === 'hi' ? 'Tum Kis Type Ke Insaan Ho' : 'What Kind Of Human Are You'}
             </span>
          </div>
          <div className="flex bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-0.5 md:p-1 border border-white/10">
            <button onClick={() => setLang('hi')} className={`px-2.5 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black tracking-widest transition-all ${lang === 'hi' ? 'bg-purple-600 text-white' : 'opacity-40 hover:opacity-100'}`}>URDU</button>
            <button onClick={() => setLang('en')} className={`px-2.5 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black tracking-widest transition-all ${lang === 'en' ? 'bg-purple-600 text-white' : 'opacity-40 hover:opacity-100'}`}>ENGLISH</button>
          </div>
        </nav>
      )}

      <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-12 max-w-[1400px] mx-auto w-full z-10">
        {state === AppState.INITIAL && (
          <div className="text-center space-y-12 md:space-y-24 px-4 md:px-12 animate-slide-up max-w-6xl py-12 md:py-32">
            <div className="space-y-6 md:space-y-10">
              <p className="text-purple-400 font-black text-xs md:text-lg tracking-[0.5em] md:tracking-[1em] uppercase">Sachi Baat Official Lab</p>
              <h1 className="text-6xl sm:text-7xl md:text-[14rem] font-bebas leading-[0.8] tracking-tighter text-white drop-shadow-[0_20px_50px_rgba(147,51,234,0.3)]">
                {lang === 'hi' ? 'Tum Kis Type Ke' : 'What Type Of'} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">{lang === 'hi' ? 'Insaan Ho?' : 'Human Are You?'}</span>
              </h1>
              <p className="text-white/60 text-lg md:text-4xl max-w-4xl mx-auto font-medium leading-relaxed italic px-4">
                {lang === 'hi' ? "Duniya ke samne toh sab acche bante hain, magar ye digital scanner aapke chehre se aapki asliyat ka pata lagayega." : "Everyone wears a mask. Our AI engine analyzes your facial micro-expressions to reveal your true nature."}
              </p>
            </div>

            <button 
              onClick={handleStart}
              className="group relative px-12 md:px-32 py-8 md:py-16 bg-white text-black rounded-[2.5rem] md:rounded-[4rem] transition-all hover:scale-105 active:scale-95 shadow-[0_40px_100px_-20px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10 font-black text-2xl md:text-6xl uppercase tracking-tighter italic">
                {lang === 'hi' ? 'SCAN START KAREIN' : 'START SCAN'}
              </span>
            </button>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <AnalysisAnimation lang={lang} onCapture={handleCapture} onComplete={handleAnimationComplete} />
        )}

        {state === AppState.RESULT && result && (
          <ResultCard result={result} lang={lang} onShare={() => {}} onReset={handleReset} />
        )}

        {state === AppState.ERROR && (
          <div className="text-center space-y-10 md:space-y-16 p-8 md:p-12 glass-card rounded-[3rem] md:rounded-[5rem] animate-slide-up max-w-4xl mx-4">
            <div className="text-red-500 text-6xl md:text-9xl">✕</div>
            <h2 className="text-lg md:text-2xl font-bold text-white leading-relaxed px-4">{errorMessage}</h2>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-white/40 font-mono">
              TIP: Ensure your API_KEY is correctly placed in the .env file and restart your project.
            </div>
            <button onClick={handleReset} className="px-10 md:px-20 py-5 md:py-10 bg-white text-black font-black text-lg md:text-2xl rounded-2xl md:rounded-[3rem] uppercase">Try Again</button>
          </div>
        )}
      </main>

      <footer className="w-full py-12 md:py-24 px-4 md:px-12 border-t border-white/5 mt-12 md:mt-24 z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-24 opacity-40">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <LogoIcon className="w-6 h-6 md:w-8 md:h-8" />
            <p className="font-bebas text-xl md:text-3xl tracking-widest text-white">SACHI BAAT LAB</p>
          </div>
          <p className="text-[10px] uppercase tracking-widest">© 2025 Sachi Baat Lab</p>
        </div>
      </footer>
    </div>
  );
}
