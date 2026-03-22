/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Music, Volume2, VolumeX, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  generateHeroBackground, 
  generateClimaxMainImage, 
  generateQuotesWithImages,
  generateRomanticImages 
} from './services/imageService';

const NO_MESSAGES = [
  "Tu as dû glisser, réessaye ! 😉",
  "Es-tu vraiment, vraiment sûr(e) ? 🥺",
  "Même après tout ce qu'on a vécu ? 💔",
  "Regarde-moi dans les yeux et redis-le... 👀",
  "Bon, j'abandonne, le bouton 'Non' est cassé par tristesse. Clique sur 'Oui' ! 🌹"
];

const FINAL_MESSAGE = "Depuis que tu es dans ma vie, chaque seconde est une poésie. Merci d'être toi, merci d'être là. Je t'aime plus que les mots ne peuvent l'écrire.";

const QUOTES_TEXT = [
  "L'amour est la poésie des sens. — Balzac",
  "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction. — Saint-Exupéry",
  "Je t'aime pour tout ce que tu es, tout ce que tu as été et tout ce que tu seras encore."
];

const PIANO_MELODY_URL = "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde6a6981.mp3";

export default function App() {
  const [step, setStep] = useState<'hero' | 'test' | 'climax'>('hero');
  const [noIndex, setNoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showQuotes, setShowQuotes] = useState(false);
  
  // AI Images State
  const [heroImg, setHeroImg] = useState<string | null>(null);
  const [climaxMainImg, setClimaxMainImg] = useState<string | null>(null);
  const [quoteItems, setQuoteItems] = useState<{ quote: string, image: string | null }[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Initial Hero Image Generation
  useEffect(() => {
    generateHeroBackground().then(setHeroImg);
  }, []);

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#E63946', '#D00000'],
        shapes: ['circle'],
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#F9E272'],
        shapes: ['square'],
      });
    }, 250);
  }, []);

  // Handle Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (step === 'climax') {
        audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
      }
    }
  }, [step, isMuted]);

  // Typewriter
  useEffect(() => {
    if (step === 'climax' && typedText.length < FINAL_MESSAGE.length) {
      const timeout = setTimeout(() => {
        setTypedText(FINAL_MESSAGE.slice(0, typedText.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    } else if (step === 'climax' && typedText.length === FINAL_MESSAGE.length) {
      setTimeout(() => setShowQuotes(true), 1000);
    }
  }, [step, typedText]);

  // Generate Climax Assets
  useEffect(() => {
    if (step === 'climax' && !isGenerating && climaxMainImg === null) {
      setIsGenerating(true);
      Promise.all([
        generateClimaxMainImage(),
        generateQuotesWithImages(QUOTES_TEXT),
        generateRomanticImages()
      ]).then(([main, quotes, gallery]) => {
        setClimaxMainImg(main);
        setQuoteItems(quotes as any);
        setGalleryImages(gallery);
        setIsGenerating(false);
      });
    }
  }, [step]);

  const handleYes = () => {
    setStep('climax');
    triggerConfetti();
  };

  const handleNo = () => {
    if (noIndex < NO_MESSAGES.length - 1) {
      setNoIndex(noIndex + 1);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-passion-red/30">
      <div className="film-grain" />
      <audio ref={audioRef} src={PIANO_MELODY_URL} loop />

      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-gold/30 text-gold hover:bg-white/20 transition-all shadow-lg"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <AnimatePresence mode="wait">
        {step === 'hero' && (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="relative h-screen flex items-center justify-center overflow-hidden"
          >
            {heroImg ? (
              <motion.div 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImg})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-midnight flex items-center justify-center">
                <Loader2 className="text-gold animate-spin" size={40} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            
            <div className="relative z-10 text-center px-4">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="font-serif text-4xl md:text-7xl text-gold mb-8 drop-shadow-2xl"
              >
                Une petite surprise t'attend ici...
              </motion.h1>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => setStep('test')}
                className="px-10 py-4 rounded-full border-2 border-gold text-gold font-medium tracking-widest uppercase text-sm hover:bg-gold hover:text-rose-white transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Découvrir
              </motion.button>
            </div>
          </motion.section>
        )}

        {step === 'test' && (
          <motion.section
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center bg-rose-white px-4 relative overflow-hidden"
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(var(--color-gold) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <motion.div 
              className="max-w-2xl w-full text-center space-y-16 relative z-10"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <div className="space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="mx-auto text-passion-red" size={64} fill="currentColor" />
                </motion.div>
                <h2 className="font-serif text-4xl md:text-6xl text-midnight leading-tight">
                  Dis-moi, mon cœur... <br/>
                  <span className="text-gold italic">Est-ce que tu m'aimes ?</span>
                </h2>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={noIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-passion-red font-medium text-xl italic h-8"
                  >
                    {noIndex > 0 ? NO_MESSAGES[noIndex - 1] : ""}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex flex-row items-center justify-center gap-8">
                <button
                  onClick={handleYes}
                  className="group flex items-center gap-3 px-8 py-4 rounded-full bg-passion-red text-white font-bold text-lg shadow-xl shadow-passion-red/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>OUI</span>
                  <Heart size={20} fill="white" className="group-hover:animate-ping" />
                </button>
                <button
                  onClick={handleNo}
                  className="px-8 py-4 rounded-full border border-midnight/20 text-midnight/40 font-medium text-lg hover:bg-midnight/5 transition-all"
                >
                  {noIndex === NO_MESSAGES.length - 1 ? "OUI (Cassé)" : "NON"}
                </button>
              </div>
            </motion.div>
          </motion.section>
        )}

        {step === 'climax' && (
          <motion.section
            key="climax"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen flex flex-col items-center justify-center bg-rose-white py-20 px-6 overflow-hidden"
          >
            {/* Animated Background */}
            <motion.div 
              animate={{ 
                scale: [1.1, 1.15, 1.1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-cover bg-center z-0"
              style={{ 
                backgroundImage: climaxMainImg ? `url(${climaxMainImg})` : 'none',
                filter: 'sepia(30%)'
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-rose-white/80 via-transparent to-rose-white/80 z-0 pointer-events-none" />

            <div className="relative z-10 max-w-5xl w-full text-center space-y-16">
              {/* Main AI Image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="relative inline-block w-full max-w-3xl mx-auto"
              >
                <motion.div 
                  animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-6 bg-gold/20 blur-3xl rounded-full z-0"
                />
                
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 15, repeat: Infinity }}
                  className="relative z-10 overflow-hidden rounded-3xl border-2 border-gold/30 shadow-2xl"
                >
                  {climaxMainImg ? (
                    <img src={climaxMainImg} alt="AI Romantic Couple" className="w-full h-80 md:h-[500px] object-cover" />
                  ) : (
                    <div className="w-full h-80 md:h-[500px] bg-gold/5 flex items-center justify-center">
                      <Loader2 className="animate-spin text-gold" size={40} />
                    </div>
                  )}
                </motion.div>
                <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-gold z-20" />
                <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-gold z-20" />
              </motion.div>

              <div className="space-y-12">
                <p className="font-serif text-3xl md:text-5xl leading-relaxed text-midnight italic max-w-4xl mx-auto">
                  {typedText}
                  <span className="animate-pulse text-gold">|</span>
                </p>
                
                <AnimatePresence>
                  {showQuotes && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-20 border-t border-gold/20 space-y-24"
                    >
                      {/* Quotes with Images */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {quoteItems.length > 0 ? quoteItems.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.3 }}
                            className="flex flex-col items-center space-y-6"
                          >
                            <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-gold/20 shadow-lg group">
                              <img src={item.image!} alt="Quote Illustration" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </div>
                            <p className="text-lg text-midnight/80 font-serif italic leading-relaxed px-4">
                              "{item.quote}"
                            </p>
                          </motion.div>
                        )) : (
                          Array(3).fill(0).map((_, i) => (
                            <div key={i} className="aspect-square bg-gold/5 animate-pulse rounded-2xl" />
                          ))
                        )}
                      </div>

                      {/* AI Gallery */}
                      <div className="space-y-10">
                        <div className="flex items-center justify-center gap-3 text-gold font-serif text-2xl">
                          <Sparkles size={28} />
                          <span>Galerie de nos Rêves</span>
                          <Sparkles size={28} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {galleryImages.length > 0 ? galleryImages.map((img, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.2 }}
                              className="group relative aspect-video overflow-hidden rounded-2xl border border-gold/20 shadow-xl"
                            >
                              <img src={img} alt={`AI Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <Heart className="text-white" fill="white" size={24} />
                              </div>
                            </motion.div>
                          )) : (
                            Array(3).fill(0).map((_, i) => (
                              <div key={i} className="aspect-video bg-gold/5 animate-pulse rounded-2xl" />
                            ))
                          )}
                        </div>
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="mt-24 font-script text-6xl text-gold"
                      >
                        Pour toujours, à tes côtés.
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
