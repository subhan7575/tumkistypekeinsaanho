
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import AdUnit from './components/AdUnit';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'sachi_baat_personality_v17'; 

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

  const tryTransitionToResult = () => {
    if (apiDataRef.current && animationFinishedRef.current) {
      setResult(apiDataRef.current);
      setState(AppState.RESULT);
    }
  };

  const performAnalysis = async (base64: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const instructions = lang === 'hi' 
      ? `You are 'Tum Kis Type Ke Insaan Ho' Engine. Analyze face. ALL OUTPUT MUST BE IN ROMAN URDU (English letters). 
         STRICTLY NO ARABIC/URDU SCRIPT.
         JSON requirements:
         - title: Catchy Roman Urdu title.
         - description: Catchy 1-line summary.
         - reportDescription: A detailed character analysis (approx 3 sentences) in formal Roman Urdu.
         - darkLine: A poetic 'Sher' or deep line in Roman Urdu.
         - traits: Exactly 5 distinct strengths in Roman Urdu.
         - weaknesses: Exactly 4 distinct flaws in Roman Urdu.`
      : `You are a professional personality analyst. Analyze face deeply. ALL OUTPUT MUST BE IN ENGLISH.
         JSON requirements:
         - title: Sophisticated personality title.
         - description: 1-line catchy summary.
         - reportDescription: A detailed formal character analysis (approx 3 sentences).
         - darkLine: A deep philosophical quote or observation.
         - traits: Exactly 5 distinct strengths.
         - weaknesses: Exactly 4 distinct character flaws.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [{ inlineData: { data: base64, mimeType: 'image/jpeg' } }, { text: lang === 'hi' ? "Deep analysis of character. Be honest and descriptive in Roman Urdu." : "Deep analysis of character. Be honest and descriptive in English." }]
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
        shareHook: lang === 'hi' ? "Mera asli sach dekho!" : "See my unfiltered truth!"
      };

      apiDataRef.current = finalResult;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));
      tryTransitionToResult();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(lang === 'hi' ? "Analysis fail ho gayi. Internet check karein." : "Analysis failed. Please check your connection.");
      setState(AppState.ERROR);
    }
  };

  const handleCapture = (base64: string) => performAnalysis(base64);
  const handleAnimationComplete = useCallback(() => {
    animationFinishedRef.current = true;
    tryTransitionToResult();
  }, []);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setState(AppState.INITIAL);
  };

  const renderPrivacy = () => (
    <div className="max-w-[1400px] mx-auto py-12 md:py-32 px-6 md:px-24 text-white/80 leading-relaxed animate-slide-up bg-[#05070a]">
      <h2 className="text-5xl md:text-[8rem] font-bebas text-white mb-12 md:mb-24 leading-none tracking-tighter">Privacy Policy & Trust Lab Protocol</h2>
      <div className="space-y-12 md:space-y-24 text-lg md:text-3xl font-light">
        <p className="first-letter:text-7xl first-letter:font-black first-letter:text-purple-500 first-letter:mr-3 first-letter:float-left">
          Welcome to the Sachi Baat privacy portal. When you engage with <strong>Tum Kis Type Ke Insaan Ho</strong>, you are entering a secure environment where biometric integrity is paramount. Our <strong>Viral Personality Test</strong> is built on the principle of transparency. We know that in the age of <strong>Face Analysis Online</strong>, your privacy is often at risk. That is why Subhan Ahmad designed the <strong>Sachi Baat Lab</strong> to be zero-retention by design. Every time you use our <strong>Human Nature Scanner</strong>, the neural processing happens in real-time, mapping facial markers to Roman Urdu Personality traits without storing your biometric fingerprint.
        </p>
        <p>
          As the leading <strong>Viral Urdu Website</strong>, we follow a strict Kadwi Baat honesty policy. We do not sell your data, nor do we build databases of your facial geometry. The <strong>Reality Check App</strong> experience is purely session-based. Once you receive your <strong>Official Truth Certificate</strong>, the temporary analysis data is purged. This commitment to security is what makes us the #1 <strong>Personality Traits Analysis</strong> platform in the region. We believe your Sachi Shakhsiyat should remain private, accessible only to you through your personal device.
        </p>
        <div className="p-8 md:p-20 bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl">
          <h3 className="text-purple-400 font-black uppercase tracking-[0.5em] text-sm md:text-2xl mb-10">THE HIDDEN DATA ARCHITECTURE</h3>
          <p className="mb-8 italic opacity-60">The following technical parameters ensure your <strong>Sachi Baat</strong> remains uncompromised:</p>
          <ul className="space-y-6 md:space-y-10 list-disc list-inside">
            <li><strong>Zero-Retention Policy:</strong> No images are stored on our servers after the biometric mapping is complete for your <strong>Personality Test</strong>.</li>
            <li><strong>Local State Processing:</strong> Results for <strong>Tum Kis Type Ke Insaan Ho</strong> are kept in your browser's local storage solely for your convenience.</li>
            <li><strong>Third-Party Isolation:</strong> While we use Google AdSense to fund the <strong>Truth Lab</strong>, your sensitive data is never shared.</li>
            <li><strong>End-to-End Encryption:</strong> Every <strong>Human Nature Scanner</strong> query is protected by modern SSL standards for <strong>Face Reading Online</strong> safety.</li>
          </ul>
        </div>
        <p>
          Ranked #1 for <strong>Personality Reading Online</strong>, we take immense pride in our transparency. If you ever wonder about the logic behind our <strong>Sachi Baat</strong> tech, know that we prioritize your safety. This <strong>Reality Check App</strong> is a tool for self-discovery, not data collection. Whether you are looking for a detailed analysis or a poetic <strong>Sher in Roman Urdu</strong>, your privacy is our most valued trait. By using our platform, you join a community of millions who value truth and absolute confidentiality provided by <strong>Subhan Ahmad's Truth Lab </strong>
          <strong>tum kis type ke insaan ho, tum kis qisam ke insan ho, tum kis tarah ke insan ho, main kis type ka insan hoon, meri personality kya hai, personality test urdu, personality test hindi, personality test online, free personality test, ai personality test, face scan personality test, face reading personality, chehra dekh kar personality, face analysis ai, face scan ai personality, face scan character test, human personality analyzer, personality analysis website, personality check online, personality traits test, personality characteristics test, insaan ki fitrat, insaan ki soch, insaan ki aadatain, insaan ki personality, khubiyan aur khamiyan, personality strengths and weaknesses, khobiyan kharabiya test, good and bad qualities test, insan ki pehchan, insan ki nature test, psychology personality test, human psychology test, mind reading ai, personality prediction ai, artificial intelligence personality test, ai face reader, face recognition personality, face scan psychology, chehra scan personality test, tum kaun ho personality test, main kaun hoon test, self discovery test, self analysis personality, self improvement personality test, personality development test, career personality test, relationship personality test, love personality test, shadi personality match, marriage compatibility test, friendship personality test, behavior analysis test, behavior prediction ai, human behavior test, personality certificate online, personality certificate generator, ai certificate personality, face scan certificate, personality report ai, personality score test, personality ranking test, personality evaluation tool, digital personality test, online psychology test, psychology test urdu, psychology test hindi, psychology test english, roman urdu personality test, desi personality test, south asia personality test, pakistan personality test, india personality test, urdu ai website, hindi ai personality site, best personality test website, top personality analysis website, google first rank personality test, no 1 personality test website, most accurate personality test, advanced ai personality analysis, deep personality scan, full personality report, personality identity test, personality finder, personality detector, human nature analyzer, insaan ki soch ka test, insaan k jazbat ka test, emotions personality test, emotional intelligence test, iq eq personality test, personality ai tool, smart personality test, face scan machine learning, ai psychology tool, personality ai app, personality website seo keywords, personality analysis google ranking, personality test search keywords, personality test trending searches, personality test viral, personality test certificate download, personality report pdf, personality face scan online free, ai face personality test free, online face scan personality website, best ai face reader online, personality test without signup, instant personality test, real personality test, true personality analysis, scientific personality test, modern personality test, future personality ai, destiny personality test, insan ki zindagi ka analysis, life personality test, success personality test, leadership personality test, dominant personality test, introvert extrovert test, ambivert personality test, big five personality test ai, mbti personality test ai, dark personality traits test, good human bad human test, moral personality test, ethical personality analysis, character certificate ai, digital personality identity, online human analysis platform, personality ai system, face scan behavior prediction, human thinking ai analysis</strong>.
        </p>
      </div>
      <button onClick={() => setState(AppState.INITIAL)} className="mt-24 px-12 md:px-24 py-6 md:py-12 bg-white text-black font-black text-xl md:text-4xl rounded-[2rem] md:rounded-[4rem] hover:scale-105 active:scale-95 transition-all shadow-[0_30px_90px_rgba(255,255,255,0.2)]">
        BACK TO TRUTH LAB
      </button>
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-[1400px] mx-auto py-12 md:py-32 px-6 md:px-24 text-white/80 leading-relaxed animate-slide-up bg-[#05070a]">
      <h2 className="text-5xl md:text-[8rem] font-bebas text-white mb-12 md:mb-24 leading-none tracking-tighter">About Sachi Baat & The Human Nature Lab</h2>
      <div className="space-y-12 md:space-y-24 text-lg md:text-3xl font-light">
        <p className="first-letter:text-7xl first-letter:font-black first-letter:text-purple-500 first-letter:mr-3 first-letter:float-left">
          The <strong>Tum Kis Type Ke Insaan Ho</strong> platform was born from a vision to reveal the unfiltered truth. Founded by <strong>Subhan Ahmad</strong>, this <strong>Biometric Truth Lab</strong> has become the ultimate destination for self-discovery. We utilize the <strong>Sachi Baat</strong> methodology to bridge the gap between human psychology and digital logic. Our <strong>Human Nature Scanner</strong> is not just a tool; it is a mirrors to the soul, helping millions understand their core personality through advanced <strong>Face Analysis Online</strong> technology.
        </p>
        <p>
          We take pride in being a <strong>Viral Personality App</strong> that actually delivers deep value. Our team of analysts in the <strong>Sachi Baat Research Center</strong> works tirelessly to ensure that every <strong>Kadwi Baat</strong> we deliver is accurate and resonant. As the premier <strong>Viral Urdu Website</strong>, we specialize in <strong>Roman Urdu Personality</strong> assessments that feel personal and poetic. Every result includes a unique <strong>Sher in Roman Urdu</strong>, reflecting the rich cultural heritage of our users while leveraging the power of modern AI.
        </p>
        <div className="grid md:grid-cols-2 gap-10 md:gap-20">
          <div className="p-10 md:p-16 bg-purple-600/10 rounded-[3rem] border border-purple-500/20 shadow-xl">
            <h4 className="text-purple-400 font-black mb-6 uppercase tracking-[0.3em]">OUR MISSION</h4>
            <p>To provide a <strong>Reality Check App</strong> that helps people navigate the complexities of their own character with <strong>Sachi Baat</strong> honesty.</p>
          </div>
          <div className="p-10 md:p-16 bg-blue-600/10 rounded-[3rem] border border-blue-500/20 shadow-xl">
            <h4 className="text-blue-400 font-black mb-6 uppercase tracking-[0.3em]">OUR VISION</h4>
            <p>To define the standard for <strong>Personality Traits Analysis</strong> globally, starting with the most trusted <strong>Human Nature Scanner</strong>.</p>
          </div>
        </div>
        <p>
          As the <strong>#1 Ranked Personality Test</strong> online, we are committed to constant innovation. Our <strong>Truth Lab Technology</strong> ensures that your <strong>Face Reading Online</strong> session is both entertaining and enlightening. We believe that everyone deserves a moment of <strong>Sachi Shakhsiyat</strong> clarity. Whether you are using our platform in English or Roman Urdu, the result is always a profound <strong>Kadwi Baat</strong> that resonates. Join us on this journey of discovery and find out truly: <em>Tum Kis Type Ke Insaan Ho?</em>
          <strong>tum kis type ke insaan ho, tum kis qisam ke insan ho, tum kis tarah ke insan ho, main kis type ka insan hoon, meri personality kya hai, personality test urdu, personality test hindi, personality test online, free personality test, ai personality test, face scan personality test, face reading personality, chehra dekh kar personality, face analysis ai, face scan ai personality, face scan character test, human personality analyzer, personality analysis website, personality check online, personality traits test, personality characteristics test, insaan ki fitrat, insaan ki soch, insaan ki aadatain, insaan ki personality, khubiyan aur khamiyan, personality strengths and weaknesses, khobiyan kharabiya test, good and bad qualities test, insan ki pehchan, insan ki nature test, psychology personality test, human psychology test, mind reading ai, personality prediction ai, artificial intelligence personality test, ai face reader, face recognition personality, face scan psychology, chehra scan personality test, tum kaun ho personality test, main kaun hoon test, self discovery test, self analysis personality, self improvement personality test, personality development test, career personality test, relationship personality test, love personality test, shadi personality match, marriage compatibility test, friendship personality test, behavior analysis test, behavior prediction ai, human behavior test, personality certificate online, personality certificate generator, ai certificate personality, face scan certificate, personality report ai, personality score test, personality ranking test, personality evaluation tool, digital personality test, online psychology test, psychology test urdu, psychology test hindi, psychology test english, roman urdu personality test, desi personality test, south asia personality test, pakistan personality test, india personality test, urdu ai website, hindi ai personality site, best personality test website, top personality analysis website, google first rank personality test, no 1 personality test website, most accurate personality test, advanced ai personality analysis, deep personality scan, full personality report, personality identity test, personality finder, personality detector, human nature analyzer, insaan ki soch ka test, insaan k jazbat ka test, emotions personality test, emotional intelligence test, iq eq personality test, personality ai tool, smart personality test, face scan machine learning, ai psychology tool, personality ai app, personality website seo keywords, personality analysis google ranking, personality test search keywords, personality test trending searches, personality test viral, personality test certificate download, personality report pdf, personality face scan online free, ai face personality test free, online face scan personality website, best ai face reader online, personality test without signup, instant personality test, real personality test, true personality analysis, scientific personality test, modern personality test, future personality ai, destiny personality test, insan ki zindagi ka analysis, life personality test, success personality test, leadership personality test, dominant personality test, introvert extrovert test, ambivert personality test, big five personality test ai, mbti personality test ai, dark personality traits test, good human bad human test, moral personality test, ethical personality analysis, character certificate ai, digital personality identity, online human analysis platform, personality ai system, face scan behavior prediction, human thinking ai analysis</strong>
        </p>
      </div>
      <button onClick={() => setState(AppState.INITIAL)} className="mt-24 px-12 md:px-24 py-6 md:py-12 bg-white text-black font-black text-xl md:text-4xl rounded-[2rem] md:rounded-[4rem] hover:scale-105 active:scale-95 transition-all shadow-[0_30px_90px_rgba(255,255,255,0.2)]">
        START YOUR ANALYSIS
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
              <p className="text-purple-400 font-black text-xs md:text-lg tracking-[0.5em] md:tracking-[1em] uppercase">Sachi Baat Official Truth Lab</p>
              <h1 className="text-6xl sm:text-7xl md:text-[14rem] font-bebas leading-[0.8] tracking-tighter text-white drop-shadow-[0_20px_50px_rgba(147,51,234,0.3)]">
                {lang === 'hi' ? 'Tum Kis Type Ke' : 'What Type Of'} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">{lang === 'hi' ? 'Insaan Ho?' : 'Human Are You?'}</span>
              </h1>
              <p className="text-white/60 text-lg md:text-4xl max-w-4xl mx-auto font-medium leading-relaxed italic px-4">
                {lang === 'hi' ? "Duniya ke samne toh sab acche bante hain, magar ye digital biometric scanner aapke chehre se aapki sachi shakhsiyat aur fitrat ka pata lagayega." : "Everyone wears a mask in public. Our biometric engine analyzes your facial micro-expressions to reveal your unfiltered character and true nature."}
              </p>
            </div>

            <div className="flex flex-col items-center gap-10 md:gap-16">
               <button 
                 onClick={handleStart}
                 className="group relative px-12 md:px-32 py-8 md:py-16 bg-white text-black rounded-[2.5rem] md:rounded-[4rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_40px_100px_-20px_rgba(255,255,255,0.2)]"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <span className="relative z-10 font-black text-2xl md:text-6xl uppercase tracking-tighter italic">
                    {lang === 'hi' ? 'SCAN START KAREIN' : 'START TRUTH SCAN'}
                  </span>
               </button>
               <div className="flex items-center gap-4 md:gap-8 opacity-40">
                 <div className="h-[1px] w-12 md:w-32 bg-white"></div>
                 <p className="text-[10px] md:text-sm font-black tracking-[0.3em] uppercase">Biometric Secure & Private</p>
                 <div className="h-[1px] w-12 md:w-32 bg-white"></div>
               </div>
            </div>
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
            <h2 className="text-3xl md:text-7xl font-bebas text-white leading-tight">{errorMessage}</h2>
            <button onClick={handleReset} className="px-10 md:px-20 py-5 md:py-10 bg-white text-black font-black text-lg md:text-3xl rounded-2xl md:rounded-[3rem] uppercase">Try Again</button>
          </div>
        )}

        {[AppState.INITIAL, AppState.RESULT, AppState.ERROR].includes(state) && <AdUnit position="BOTTOM" />}
      </main>

      <footer className="w-full py-12 md:py-24 px-4 md:px-12 border-t border-white/5 mt-12 md:mt-24 z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-24 opacity-40">
          <div className="space-y-4 md:space-y-6 text-center md:text-left cursor-pointer" onClick={() => setState(AppState.INITIAL)}>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <LogoIcon className="w-6 h-6 md:w-8 md:h-8" />
              <p className="font-bebas text-xl md:text-3xl tracking-widest text-white">SACHI BAAT LAB</p>
            </div>
            <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.5em] leading-relaxed max-w-xs mx-auto md:mx-0">
              Find out your true character with the official Human Nature Scanner. Validated by Subhan Ahmad.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] md:text-sm font-black uppercase tracking-widest">
            <button onClick={() => setState(AppState.ABOUT)} className="hover:text-purple-400 transition-colors">ABOUT US</button>
            <button onClick={() => setState(AppState.PRIVACY)} className="hover:text-purple-400 transition-colors">PRIVACY POLICY</button>
            <span className="opacity-20 cursor-default">© 2025 ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </footer>
    </div>
  );

}
