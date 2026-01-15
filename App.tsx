
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, PersonalityResult, Language } from './types';
import { PERSONALITIES } from './constants';
import AnalysisAnimation from './components/AnalysisAnimation';
import ResultCard from './components/ResultCard';
import AdUnit from './components/AdUnit';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'sachi_baat_personality_v15'; 

export const LogoIcon = ({ className = "w-24 h-24 mb-6", showGlow = true }) => (
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
    setState(AppState.ANALYZING);
  };

  const performAnalysis = async (base64: string) => {
    // Fix: Initialize GoogleGenAI using process.env.API_KEY directly as per SDK guidelines.
    // The existence and validity of API_KEY is assumed to be handled by the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const instructions = lang === 'hi' 
      ? `You are the 'Sachi Baat' Personality Engine. 
         Analyze the face with surgical detail.
         STRICT RULE: Do not be overly nice. Be honest about flaws (weaknesses) and strengths.
         
         OUTPUT MUST BE JSON:
         - title: Catchy Roman Urdu title.
         - description: Detailed paragraph in Roman Urdu addressing the user as 'Aap'.
         - reportDescription: Formal 3rd person analysis.
         - darkLine: One raw viral signature line.
         - traits: Array of 3 strengths.
         - weaknesses: Array of 2 actual flaws.`
      : `Analyze the face deeply. Be honest about strengths and flaws. Provide JSON with title, description, reportDescription, darkLine, traits, and weaknesses.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: "Detailed personality biometric analysis based on this face. Be raw and real." }
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

      setResult(finalResult);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setErrorMessage(err.message || "Neural Analysis Failed. Check internet connection.");
      setState(AppState.ERROR);
    }
  };

  const handleCapture = (base64: string) => {
    performAnalysis(base64);
  };

  const handleAnalysisComplete = useCallback(() => {
    // Only transition if we haven't hit an error during async process
    setState(prev => prev === AppState.ERROR ? AppState.ERROR : AppState.RESULT);
  }, []);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setErrorMessage(null);
    setState(AppState.INITIAL);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center z-10 bg-neural-gradient selection:bg-purple-600 selection:text-white">
      <AdUnit position="SIDE_LEFT" />
      <AdUnit position="SIDE_RIGHT" />

      <nav className="w-full flex justify-between items-center px-8 py-6 max-w-7xl animate-slow-fade">
        <div className="flex items-center gap-3">
           <LogoIcon className="w-8 h-8" showGlow={false} />
           <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Truth Lab v3.0</span>
        </div>
        <div className="flex bg-white/5 rounded-xl border border-white/5 p-1 backdrop-blur-md">
          <button onClick={() => setLang('hi')} className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all ${lang === 'hi' ? 'bg-purple-600 text-white' : 'text-white/30 hover:text-white'}`}>URDU</button>
          <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-white/30 hover:text-white'}`}>ENGLISH</button>
        </div>
      </nav>

      <AdUnit position="HEADER" />

      <main className="flex-1 w-full flex flex-col items-center justify-center py-6 px-6">
        {state === AppState.INITIAL && (
          <div className="flex flex-col items-center text-center space-y-8 animate-slide-up max-w-4xl">
            <LogoIcon />
            <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-bebas tracking-tighter text-white uppercase leading-none">
                {lang === 'hi' ? 'SACHI' : 'PURE'} <span className="text-purple-500">{lang === 'hi' ? 'BAAT' : 'TRUTH'}</span>
              </h1>
              <p className="text-white/50 text-xs md:text-lg font-light tracking-[0.5em] uppercase px-4">Direct Biometric Disclosure — No Filter</p>
            </div>
            <button onClick={handleStart} className="px-14 py-6 bg-white text-black font-bold tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl border border-white/10">
              {lang === 'hi' ? 'KADWA SACH JAANEIN' : 'REVEAL PURE TRUTH'}
            </button>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <AnalysisAnimation onCapture={handleCapture} onComplete={handleAnalysisComplete} lang={lang} />
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center text-center space-y-6 animate-slide-up bg-red-500/10 p-10 rounded-3xl border border-red-500/20 max-w-md">
            <div className="text-red-500 text-4xl font-bold">!</div>
            <h2 className="text-2xl font-bebas text-white tracking-widest">SYSTEM ERROR</h2>
            <p className="text-white/60 text-sm leading-relaxed">{errorMessage}</p>
            <button onClick={handleReset} className="px-10 py-4 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest">Restart</button>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="w-full max-w-5xl animate-slide-up">
            <ResultCard result={result} onShare={() => {}} lang={lang} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="w-full py-12 flex flex-col items-center gap-2 border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold">Proprietary Algorithm by Subhan Ahmad</p>
        <p className="text-[8px] text-white/10 uppercase tracking-[0.6em]">All Real Analysis © 2025</p>
      </footer>
    </div>
  );
}
