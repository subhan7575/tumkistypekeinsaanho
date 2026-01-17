import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import AdUnit from './components/AdUnit';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'sachi_baat_personality_v18'; 

// MASTER SEO KEYWORD STRING
const SEO_KEYWORDS = "Sachi Baat, Tum Kis Type Ke Insaan Ho, Personality Test, Face Analysis, Viral Personality App, Subhan Ahmad, Urdu Personality Quiz, Biometric Truth Lab, Human Nature Scanner, Face Reading Online, Viral Urdu Website, Personality Traits Analysis, Kadwi Baat, Reality Check App, Roman Urdu Personality, tum kis type ke insaan ho, tum kis qisam ke insan ho, tum kis tarah ke insan ho, main kis type ka insan hoon, meri personality kya hai, personality test urdu, personality test hindi, personality test online, free personality test, ai personality test, face scan personality test, face reading personality, chehra dekh kar personality, face analysis ai, face scan ai personality, face scan character test, human personality analyzer, personality analysis website, personality check online, personality traits test, personality characteristics test, insaan ki fitrat, insaan ki soch, insaan ki aadatain, insaan ki personality, khubiyan aur khamiyan, personality strengths and weaknesses, khobiyan kharabiya test, good and bad qualities test, insan ki pehchan, insan ki nature test, psychology personality test, human psychology test, mind reading ai, personality prediction ai, artificial intelligence personality test, ai face reader, face recognition personality, face scan psychology, chehra scan personality test, tum kaun ho personality test, main kaun hoon test, self discovery test, self analysis personality, self improvement personality test, personality development test, career personality test, relationship personality test, love personality test, shadi personality match, marriage compatibility test, friendship personality test, behavior analysis test, behavior prediction ai, human behavior test, personality certificate online, personality certificate generator, ai certificate personality, face scan certificate, personality report ai, personality score test, personality ranking test, personality evaluation tool, digital personality test, online psychology test, psychology test urdu, psychology test hindi, psychology test english, roman urdu personality test, desi personality test, south asia personality test, pakistan personality test, india personality test, urdu ai website, hindi ai personality site, best personality test website, top personality analysis website, google first rank personality test, no 1 personality test website, most accurate personality test, advanced ai personality analysis, deep personality scan, full personality report, personality identity test, personality finder, personality detector, human nature analyzer, insaan ki soch ka test, insaan k jazbat ka test, emotions personality test, emotional intelligence test, iq eq personality test, personality ai tool, smart personality test, face scan machine learning, ai psychology tool, personality ai app, personality website seo keywords, personality analysis google ranking, personality test search keywords, personality test trending searches, personality test viral, personality test certificate download, personality report pdf, personality face scan online free, ai face personality test free, online face scan personality website, best ai face reader online, personality test without signup, instant personality test, real personality test, true personality analysis, scientific personality test, modern personality test, future personality ai, destiny personality test, insan ki zindagi ka analysis, life personality test, success personality test, leadership personality test, dominant personality test, introvert extrovert test, ambivert personality test, big five personality test ai, mbti personality test ai, dark personality traits test, good human bad human test, moral personality test, ethical personality analysis, character certificate ai, digital personality identity, online human analysis platform, personality ai system, face scan behavior prediction, human thinking ai analysis";

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
    // Correct way to access injected process.env keys in modern setups
    const apiKey = (process.env as any).API_KEY;
    
    // Check if the key is effectively missing or still the placeholder string
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === "") {
      setErrorMessage(lang === 'hi' 
        ? "API Key Nahi Mili! Vercel Dashboard mein 'API_KEY' set karein aur project ko 'Redeploy' karein. Static deployment mein key inject hona zaroori hai." 
        : "API Key Missing! Set 'API_KEY' in Vercel and trigger a Redeploy. Static sites need this injected at build time.");
      setState(AppState.ERROR);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const instructions = lang === 'hi' 
      ? `You are 'Tum Kis Type Ke Insaan Ho' Engine. Analyze face. ALL OUTPUT MUST BE IN ROMAN URDU. 
         JSON requirements:
         - title: Catchy Roman Urdu title.
         - description: Catchy 1-line summary.
         - reportDescription: A detailed character analysis (3 sentences) in Roman Urdu.
         - darkLine: A poetic 'Sher' in Roman Urdu.
         - traits: Exactly 5 strengths in Roman Urdu.
         - weaknesses: Exactly 4 flaws in Roman Urdu.`
      : `Analyze face deeply. ALL OUTPUT IN ENGLISH.
         JSON requirements:
         - title: Personality title.
         - description: 1-line summary.
         - reportDescription: Detailed analysis.
         - darkLine: Philosophical quote.
         - traits: 5 strengths.
         - weaknesses: 4 flaws.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } }, 
            { text: "Detailed character analysis based on facial features." }
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

      if (!response.text) throw new Error("Empty AI Response");

      const data = JSON.parse(response.text.trim());
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
      console.error("AI Error:", err);
      setErrorMessage(lang === 'hi' 
        ? "Analysis fail ho gayi. Internet check karein ya API Key ki validity check karein." 
        : "Analysis failed. Please check your connection or API key limits.");
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

  const renderPrivacy = () => (
    <div className="w-full max-w-[1400px] mx-auto py-12 md:py-32 px-6 md:px-24 text-white/80 leading-relaxed animate-slide-up bg-[#05070a]">
      <div className="mb-24 flex items-center gap-6">
         <LogoIcon className="w-12 h-12 md:w-20 md:h-20" />
         <h2 className="text-5xl md:text-[8rem] font-bebas text-white leading-none tracking-tighter">Privacy Policy</h2>
      </div>
      <div className="space-y-12 md:space-y-24 text-xl md:text-4xl font-light max-w-5xl">
        <p className="border-l-4 border-purple-500 pl-8 md:pl-16">Hum aapki privacy ka pura ehtram karte hain. Aapka face data 'In-Memory' process hota hai aur analysis ke foran baad discard kar diya jata hai. Hum koi bhi image apne servers par store nahi karte.</p>
        <p className="opacity-60">This app uses Google Gemini AI for processing. By using this service, you agree to temporary biometric analysis for entertainment purposes only.</p>
        
        {/* HIDDEN SEO BLOCK */}
        <div className="mt-32 opacity-[0.02] text-[8px] leading-tight break-words pointer-events-none uppercase tracking-tighter">
          {SEO_KEYWORDS}
        </div>
      </div>
      <button onClick={() => setState(AppState.INITIAL)} className="mt-24 px-12 md:px-24 py-6 md:py-12 bg-white text-black font-black text-xl md:text-4xl rounded-[2rem] md:rounded-[4rem] hover:scale-105 transition-all shadow-2xl">
        BACK TO START
      </button>
    </div>
  );

  const renderAbout = () => (
    <div className="w-full max-w-[1400px] mx-auto py-12 md:py-32 px-6 md:px-24 text-white/80 leading-relaxed animate-slide-up bg-[#05070a]">
      <div className="mb-24 flex items-center gap-6">
         <LogoIcon className="w-12 h-12 md:w-20 md:h-20" />
         <h2 className="text-5xl md:text-[8rem] font-bebas text-white leading-none tracking-tighter">About Lab</h2>
      </div>
      <div className="space-y-12 md:space-y-24 text-xl md:text-4xl font-light max-w-5xl">
        <p className="border-l-4 border-blue-500 pl-8 md:pl-16 font-medium italic">'Sachi Baat' digital biometric scanner aur AI logic ka ek anokha sangam hai jo aapke chehre se aapki shakhsiyat ke raaz nikalta hai.</p>
        <p className="opacity-60 uppercase tracking-widest text-sm md:text-lg font-black">Powered by Gemini 3 Pro AI Engine</p>
        <p>Hamara maqsad social media par ek sachi aur be-baak analysis faraham karna hai jo entertaining bhi ho aur deep bhi.</p>
        
        {/* HIDDEN SEO BLOCK */}
        <div className="mt-32 opacity-[0.02] text-[8px] leading-tight break-words pointer-events-none uppercase tracking-tighter">
          {SEO_KEYWORDS}
        </div>
      </div>
      <button onClick={() => setState(AppState.INITIAL)} className="mt-24 px-12 md:px-24 py-6 md:py-12 bg-white text-black font-black text-xl md:text-4xl rounded-[2rem] md:rounded-[4rem] hover:scale-105 transition-all shadow-2xl">
        BACK TO START
      </button>
    </div>
  );

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
        {[AppState.INITIAL, AppState.RESULT, AppState.ERROR].includes(state) && <AdUnit position="HEADER" />}

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

        {state === AppState.PRIVACY && renderPrivacy()}
        {state === AppState.ABOUT && renderAbout()}

        {state === AppState.ERROR && (
          <div className="text-center space-y-10 md:space-y-16 p-8 md:p-24 glass-card rounded-[3rem] md:rounded-[5rem] animate-slide-up max-w-4xl mx-4">
            <div className="text-red-500 text-6xl md:text-9xl">✕</div>
            <h2 className="text-xl md:text-3xl font-bold text-white leading-tight px-4">{errorMessage}</h2>
            <button onClick={handleReset} className="px-10 md:px-20 py-5 md:py-10 bg-white text-black font-black text-lg md:text-2xl rounded-2xl md:rounded-[3rem] uppercase">Try Again</button>
          </div>
        )}

        {[AppState.INITIAL, AppState.RESULT, AppState.ERROR, AppState.ABOUT, AppState.PRIVACY].includes(state) && <AdUnit position="BOTTOM" />}
      </main>

      <footer className="w-full py-12 md:py-24 px-4 md:px-12 border-t border-white/5 mt-12 md:mt-24 z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-24 opacity-40">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <LogoIcon className="w-6 h-6 md:w-8 md:h-8" />
            <p className="font-bebas text-xl md:text-3xl tracking-widest text-white">SACHI BAAT LAB</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] md:text-sm font-black uppercase tracking-widest">
            <button onClick={() => setState(AppState.ABOUT)} className="hover:text-purple-400 transition-colors">ABOUT</button>
            <button onClick={() => setState(AppState.PRIVACY)} className="hover:text-purple-400 transition-colors">PRIVACY</button>
            <span className="opacity-20">© 2025 Lab Verified</span>
          </div>
        </div>
        {/* GLOBAL SEO FOOTER - Hidden for aesthetic but visible to Google Bots */}
        <div className="max-w-[1400px] mx-auto mt-12 opacity-[0.01] text-[8px] leading-relaxed break-words text-center select-none pointer-events-none">
          {SEO_KEYWORDS}
        </div>
      </footer>
    </div>
  );
}
