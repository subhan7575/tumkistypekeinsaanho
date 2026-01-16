
import { PersonalityResult } from './types';

export const PERSONALITIES: PersonalityResult[] = [
  {
    id: 'SB-007',
    title: 'Aala Zehen Strategic Leader 👑',
    description: 'Aapka chehra batata hai ke aap bheed mein khade rehne ke liye nahi, bheed ko lead karne ke liye paida hue hain. Aapki vibe bilkul alag hai.',
    reportDescription: 'Subject exhibits advanced strategic cognitive patterns. Facial biometric markers indicate high leadership potential and preemptive logic processing.',
    darkLine: 'Zamaana jhukta hai, bas jhukaane wala chahiye.',
    shareHook: 'Mera asli result dekh kar hairan reh jaoge!',
    color: '#9333ea',
    // Added missing traits and weaknesses to satisfy the PersonalityResult interface
    traits: ['Leadership potential', 'Strategic mindset', 'Commanding presence'],
    weaknesses: ['Can be overly authoritative', 'Sometimes loses patience with details']
  }
];

export const DRAMATIC_MESSAGES = {
  hi: [
    "Chehra Scan Kiya Ja Raha Hai...",
    "Neural Patterns Decode Ho Rahe Hain...",
    "Aapki Fitrat Ka Pata Lagaya Ja Raha Hai...",
    "Aankhon Se Raaz Nikale Ja Rahe Hain...",
    "Digital Logic Processing Shuru...",
    "Mazi Ki Yaadon Ka Analysis...",
    "Asli Shakhsiyat Mil Gayi Hai...",
    "Official Report Tayyar Ho Rahi Hai...",
    "Akhri Verification...",
    "Bas Ek Second Aur..."
  ],
  en: [
    "Scanning Facial Geometry...",
    "Decoding Emotional Intelligence...",
    "Accessing Hidden Subconscious...",
    "Mapping Micro-Expressions...",
    "Analyzing True Character Traits...",
    "Retrieving Deep Memories...",
    "Core Persona Identified...",
    "Preparing Official Certificate...",
    "Final Logic Processing...",
    "Almost Ready..."
  ]
};
